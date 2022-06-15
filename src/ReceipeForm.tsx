import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import {
  Button,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import { useForm, UseFormSetValue } from "react-hook-form";
import { buildRoute } from "./buildRoute";
import { Recipe } from "../models/recipe";
import React, { useEffect, useRef, useState } from "react";
import FullPageSpinner from "./FullPageSpinner";
import { v4 as uuidv4 } from "uuid";
import { ContainerClient } from "@azure/storage-blob";
import ImageBlobReduce from "image-blob-reduce";
import { UploadedFile } from "../models/uploadedFile";

type FormFields = {
  title: string;
  notes: string;
  link: string;
};

async function postData(url = "", data = {}) {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function patchData(url = "", data = {}) {
  return await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export default function ReceipeForm({
  recipeId,
  onClose,
}: {
  recipeId?: string;
  onClose: () => void;
}) {
  const { register, handleSubmit, reset } = useForm<FormFields>();
  const [files, setFiles] = useState<Array<UploadedFile>>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { isLoading, data: defaultRecipeData } = useQuery<Recipe>(
    ["recipes", recipeId],
    async () => {
      if (recipeId) {
        const res = await fetch(buildRoute(`/api/recipes/${recipeId}`));
        return await res.json();
      } else {
        return Promise.resolve({
          title: "",
          notes: "",
        } as Recipe);
      }
    }
  );

  const hasFormInitialized = useRef(false);

  useEffect(() => {
    if (!hasFormInitialized.current && !isLoading) {
      reset({
        title: defaultRecipeData?.title ?? "",
        notes: defaultRecipeData?.notes ?? "",
        link: defaultRecipeData?.link ?? "",
      });
      setFiles(defaultRecipeData?.files ?? []);
      hasFormInitialized.current = true;
    }
  }, [defaultRecipeData, isLoading]);

  const { mutate: saveForm, isLoading: mutateIsSaving } = useGetSaveMutation(
    recipeId,
    queryClient,
    onClose
  );

  const { mutate: uploadFile, isLoading: fileIsSaving } = useUploadFileMutation(
    setFiles,
    fileRef
  );

  if (isLoading) {
    return <FullPageSpinner />;
  }

  return (
    <>
      {mutateIsSaving || fileIsSaving ? <FullPageSpinner /> : null}

      <Modal isOpen={true}>
        <ModalHeader>Recipe</ModalHeader>
        <ModalBody>
          <form
            onSubmit={handleSubmit((data) =>
              saveForm({
                ...data,
                files,
              })
            )}
            id="modalForm"
          >
            <FormGroup>
              <Label for="title" className="required">
                Title
              </Label>
              <input
                id="title"
                type="text"
                className="form-control"
                required
                {...register("title")}
              />
            </FormGroup>
            <FormGroup>
              <Label for="link">Link</Label>
              <input
                id="link"
                type="url"
                className="form-control"
                {...register("link")}
              />
            </FormGroup>
            <FormGroup>
              <Label for="notes">Notes</Label>
              <input
                id="notes"
                type="textarea"
                className="form-control"
                {...register("notes")}
              />
            </FormGroup>
            {files.map((f) => (
              <FormGroup key={f.id}>
                <div>
                  <img src={f.url} width="400px" />
                </div>
                <Button
                  type="button"
                  className="mt-2"
                  size="sm"
                  onClick={() =>
                    setFiles((existingFiles) =>
                      existingFiles.filter(
                        (existingFile) => existingFile.id !== f.id
                      )
                    )
                  }
                >
                  Delete
                </Button>
              </FormGroup>
            ))}
            <FormGroup>
              <Label for="picture">Add Photo</Label>
              <input
                id="picture"
                type="file"
                className="form-control"
                ref={fileRef}
                onChange={(e) => {
                  uploadFile((e as any).target.files);
                }}
              />
            </FormGroup>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button type="submit" color="primary" form="modalForm">
            Save
          </Button>
          <Button type="button" color="secondary" onClick={() => onClose()}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
function useGetSaveMutation(
  recipeId: string | undefined,
  queryClient: QueryClient,
  onClose: () => void
): { mutate: any; isLoading: any } {
  return useMutation(
    async (recipe: FormFields & { files: Array<UploadedFile> }) => {
      let response;
      if (recipeId) {
        response = await patchData(`/api/recipes/${recipeId}`, recipe);
      } else {
        response = await postData("/api/recipes", recipe);
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recipes");
        onClose();
      },
      onError: (e) => console.error(JSON.stringify(e)),
    }
  );
}

function useUploadFileMutation(
  setFiles: React.Dispatch<React.SetStateAction<Array<UploadedFile>>>,
  fileRef: React.RefObject<HTMLInputElement>
) {
  return useMutation(
    async (files: FileList) => {
      const { connectionString } = (await fetch("/api/FileUploadPath").then(
        (r) => r.json()
      )) as {
        connectionString: string;
      };

      const containerClient = new ContainerClient(connectionString);

      const file = files[0];

      const reduce = new ImageBlobReduce();
      const newBlob = await reduce.toBlob(file, { max: 1024 });

      const blockBlobClient = containerClient.getBlockBlobClient(file.name);
      await blockBlobClient.uploadData(newBlob, {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });
      return removeSasToken(blockBlobClient.url);
    },
    {
      onSuccess: (uploadedUrl) =>
        setFiles((f) => [
          ...f,
          {
            id: uuidv4(),
            url: uploadedUrl,
          },
        ]),

      onSettled: () => {
        if (fileRef?.current) {
          fileRef.current.value = "";
        }
      },
    }
  );
}

function removeSasToken(input: string) {
  return input.split("?")[0];
}

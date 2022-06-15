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
import { useEffect, useRef } from "react";
import FullPageSpinner from "./FullPageSpinner";
import { uuid } from "uuidv4";
import { ContainerClient } from "@azure/storage-blob";
import ImageBlobReduce from "image-blob-reduce";

type FormPayload = {
  title: string;
  notes: string;
  link: string;
  picture: string;
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
  const { register, handleSubmit, reset, setValue } = useForm<FormPayload>();
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
      hasFormInitialized.current = true;
    }
  }, [defaultRecipeData, isLoading]);

  const { mutate: saveForm, isLoading: mutateIsSaving } = useGetSaveMutation(
    recipeId,
    queryClient,
    onClose
  );

  const { mutate: uploadFile, isLoading: fileIsSaving } =
    useUploadFileMutation(setValue);

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
            onSubmit={handleSubmit((data) => saveForm(data))}
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
            <FormGroup>
              <Label for="picture">Picture</Label>
              <input
                id="picture"
                type="file"
                className="form-control"
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
    async (recipe: FormPayload) => {
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

function useUploadFileMutation(setValue: UseFormSetValue<FormPayload>) {
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
      onSuccess: (r) => setValue("picture", r),
    }
  );
}

function removeSasToken(input: string) {
  return input.split("?")[0];
}

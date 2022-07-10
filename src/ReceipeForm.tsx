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
} from "reactstrap";
import { useForm } from "react-hook-form";
import { buildRoute } from "./buildRoute";
import { Recipe } from "../models/recipe";
import { ErrorResponse } from "../models/errorResponse";
import React, { useEffect, useRef, useState } from "react";
import FullPageSpinner from "./FullPageSpinner";
import { v4 as uuidv4 } from "uuid";
import { ContainerClient } from "@azure/storage-blob";
import ImageBlobReduce from "image-blob-reduce";
import { UploadedFile } from "../models/uploadedFile";

import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import { patchData, postData } from "./services/httpUtilities";
import ReceipeFormIngredients from "./ReceipeFormIngredients";

export type RecipeFormFields = {
  title: string;
  notes: string;
  link: string;
  ingredients: Array<{ id: string; name: string }>;
};

export default function ReceipeForm({
  recipeId,
  onClose,
}: {
  recipeId?: string;
  onClose: () => void;
}) {
  const { register, handleSubmit, reset, control, setFocus } =
    useForm<RecipeFormFields>();
  const [files, setFiles] = useState<Array<UploadedFile>>([]);

  const [selectedTags, setSelectedTags] = useState<Array<{ name: string }>>([]);
  const [errorResponse, setErrorResponse] = useState<ErrorResponse | null>(
    null
  );

  const fileRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { isLoading: isLoadingRecipeData, data: defaultRecipeData } =
    useLoadRecipeData(recipeId);
  const { isLoading: isLoadingTags, data: tags } = useLoadTags();

  const hasFormInitialized = useRef(false);

  useEffect(() => {
    if (!hasFormInitialized.current && !isLoadingRecipeData) {
      reset({
        title: defaultRecipeData?.title ?? "",
        notes: defaultRecipeData?.notes ?? "",
        link: defaultRecipeData?.link ?? "",
        ingredients: defaultRecipeData?.ingredients ?? [
          {
            id: uuidv4(),
            name: "",
          },
        ],
      });
      setFiles(defaultRecipeData?.files ?? []);
      setSelectedTags(defaultRecipeData?.tags ?? []);
      hasFormInitialized.current = true;
    }
  }, [defaultRecipeData, isLoadingRecipeData]);

  const hasSetFocus = useRef<boolean>(false);
  useEffect(() => {
    if (!recipeId && !hasSetFocus.current) {
      setTimeout(() => {
        setFocus("title");
      });
      hasSetFocus.current = true;
    }
  }, [recipeId]);

  const { mutate: saveForm, isLoading: mutateIsSaving } = useGetSaveMutation(
    recipeId,
    queryClient,
    setErrorResponse,
    onClose
  );

  const { mutate: uploadFile, isLoading: fileIsSaving } = useUploadFileMutation(
    setFiles,
    fileRef
  );

  if (isLoadingRecipeData || isLoadingTags) {
    return <FullPageSpinner />;
  }

  return (
    <>
      <Modal isOpen={true} scrollable>
        <ModalHeader toggle={() => onClose()}>Recipe</ModalHeader>
        <ModalBody>
          {mutateIsSaving || fileIsSaving ? <FullPageSpinner /> : null}
          <form
            onSubmit={handleSubmit((data) =>
              saveForm({
                ...data,
                files,
                tags: selectedTags,
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
            <ReceipeFormIngredients control={control} register={register} />
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
                  <img src={f.url} width="250px" />
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
                accept="image/*"
                onChange={(e) => {
                  uploadFile((e as any).target.files);
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="tags">Tags</Label>
              <Typeahead
                id="tags"
                allowNew
                multiple
                options={tags?.map((t) => t.name) ?? []}
                defaultSelected={(selectedTags ?? []).map((t) => t.name)}
                onChange={(e) => {
                  setSelectedTags(
                    e.map((t) => ({
                      name: (t as any).label,
                    }))
                  );
                }}
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
          </form>
        </ModalBody>
        <ModalFooter className="justify-content-between">
          <div className="text-danger">{errorResponse?.error}</div>
          <div>
            <Button
              type="submit"
              color="primary"
              form="modalForm"
              className="me-2"
            >
              Save
            </Button>
            <Button type="button" color="secondary" onClick={() => onClose()}>
              Cancel
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}

function useLoadRecipeData(recipeId: string | undefined) {
  return useQuery<Recipe>(["recipes", recipeId], async () => {
    if (recipeId) {
      const res = await fetch(buildRoute(`/api/recipes/${recipeId}`));
      return await res.json();
    } else {
      return Promise.resolve({
        title: "",
        notes: "",
      } as Recipe);
    }
  });
}

function useLoadTags() {
  return useQuery<Array<{ name: string }>>(["tags"], async () => {
    const res = await fetch(buildRoute(`/api/tags`));
    const resultArray = await res.json();
    return resultArray.tags;
  });
}

function useGetSaveMutation(
  recipeId: string | undefined,
  queryClient: QueryClient,
  setErrorResponse: React.Dispatch<React.SetStateAction<ErrorResponse | null>>,
  onClose: () => void
): { mutate: any; isLoading: any } {
  const defaultErrorResponse: ErrorResponse = {
    error: "An unknown error occurred while saving.",
  };

  return useMutation(
    async (
      recipe: RecipeFormFields & { files: Array<UploadedFile> } & {
        tags: Array<{ name: string }>;
      }
    ) => {
      setErrorResponse(null);

      let response;
      try {
        if (recipeId) {
          response = await patchData(`/api/recipes/${recipeId}`, recipe);
        } else {
          response = await postData("/api/recipes", recipe);
        }
      } catch (e) {
        setErrorResponse(defaultErrorResponse);
        throw e;
      }

      if (!response.ok) {
        let errorResponseSet = false;
        try {
          const responseBody = await response.json();
          if (
            typeof responseBody === "object" &&
            typeof responseBody.error === "string"
          ) {
            setErrorResponse(responseBody);
            errorResponseSet = true;
          }
        } catch {
          console.error("exception reading body");
        }

        if (!errorResponseSet) {
          setErrorResponse(defaultErrorResponse);
        }

        throw new Error("Network response was not ok");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recipes");
        queryClient.invalidateQueries("tags");
        onClose();
      },
      onError: (e) => {
        console.error(JSON.stringify(e));
      },
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

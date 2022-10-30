import { ContainerClient } from "@azure/storage-blob";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import ImageBlobReduce from "image-blob-reduce";
import toast from "react-hot-toast";
import { ErrorResponse } from "@models/errorResponse";
import { Recipe } from "@models/recipe";
import { UploadedFile } from "@models/uploadedFile";
import {
  executeDelete,
  executeGet,
  executePatch,
  executePost,
} from "../services/httpUtilities";
import { RecipeFormFields } from "./ReceipeForm";
import { v4 as uuidv4 } from "uuid";

const recipeKeys = {
  all: ["recipes"] as const,
};

const tagKeys = {
  all: ["tags"] as const,
};

export function useDeleteReceipe() {
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      await executeDelete(`/api/recipes?id=${id}`);
    },
    {
      onMutate: async (id: string) => {
        await queryClient.cancelQueries(recipeKeys.all);

        const oldQueryData = queryClient.getQueriesData(recipeKeys.all);

        queryClient.setQueryData<{ recipes: Array<Recipe> }>(
          recipeKeys.all,
          (old) => ({ recipes: old?.recipes.filter((r) => r.id !== id) ?? [] })
        );

        return { previousRecipes: oldQueryData[0][1] };
      },

      onSettled: () => {
        queryClient.invalidateQueries(recipeKeys.all);
      },

      onError: (err: any, newRecipes: any, context: any) => {
        toast.error("Unable to delete item");
        queryClient.setQueryData(recipeKeys.all, context.previousRecipes);
      },
    }
  );
}

export function useLoadRecipeData(recipeId: string | undefined) {
  return useQuery<Recipe>(["recipes", recipeId], async () => {
    if (recipeId) {
      const res = await executeGet(`/api/recipes/${recipeId}`);
      return await res.json();
    } else {
      return Promise.resolve({
        title: "",
        notes: "",
      } as Recipe);
    }
  });
}

export function useLoadTags() {
  return useQuery<Array<{ name: string }>>([tagKeys.all], async () => {
    const res = await executeGet(`/api/tags`);
    const resultArray = await res.json();
    return resultArray.tags;
  });
}

export function useGetSaveMutation(
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
          response = await executePatch(`/api/recipes/${recipeId}`, recipe);
        } else {
          response = await executePost("/api/recipes", recipe);
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
        queryClient.invalidateQueries(recipeKeys.all);
        queryClient.invalidateQueries([tagKeys.all]);
        onClose();
      },
      onError: (e) => {
        console.error(JSON.stringify(e));
      },
    }
  );
}

export function useUploadFileMutation(
  setFiles: React.Dispatch<React.SetStateAction<Array<UploadedFile>>>,
  fileRef: React.RefObject<HTMLInputElement>
) {
  return useMutation(
    async (files: FileList) => {
      const { connectionString } = (await executeGet(
        "/api/FileUploadPath"
      ).then((r) => r.json())) as {
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

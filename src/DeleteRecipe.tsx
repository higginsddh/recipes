import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import IconButton from "./IconButton";
import { Recipe } from "../models/recipe";
import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import toast from "react-hot-toast";
import { executeDelete } from "./services/httpUtilities";

export default function DeleteRecipe({
  recipeId,
  title,
}: {
  recipeId: string;
  title: string;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useDeleteReceipe(queryClient);

  return (
    <>
      <IconButton onClick={() => setShowConfirmation(true)}>
        <FontAwesomeIcon
          icon={faTrash}
          title="Delete Receipt"
          className="ps-3"
        />
      </IconButton>
      {showConfirmation ? (
        <Modal isOpen={true}>
          <ModalBody>
            Are you sure you want to delete{" "}
            <span className="fw-bold">{title}</span>?
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              color="primary"
              className="mr-3"
              onClick={() => {
                mutation.mutate(recipeId);
                setShowConfirmation(false);
              }}
            >
              Yes
            </Button>
            <Button type="button" onClick={() => setShowConfirmation(false)}>
              No
            </Button>
          </ModalFooter>
        </Modal>
      ) : null}
    </>
  );
}

function useDeleteReceipe(queryClient: QueryClient) {
  return useMutation(
    async (id: string) => {
      await executeDelete(`/api/recipes?id=${id}`);
    },
    {
      onMutate: async (id: string) => {
        await queryClient.cancelQueries("recipes");

        const oldQueryData = queryClient.getQueriesData(["recipes"]);

        queryClient.setQueryData<{ recipes: Array<Recipe> }>(
          "recipes",
          (old) => ({ recipes: old?.recipes.filter((r) => r.id !== id) ?? [] })
        );

        return { previousRecipes: oldQueryData[0][1] };
      },

      onSettled: () => {
        queryClient.invalidateQueries("recipes");
      },

      onError: (err: any, newRecipes: any, context: any) => {
        toast.error("Unable to delete item");
        queryClient.setQueryData("recipes", context.previousRecipes);
      },
    }
  );
}

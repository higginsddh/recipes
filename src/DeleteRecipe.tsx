import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import { buildRoute } from "./buildRoute";
import IconButton from "./IconButton";
import { Recipe } from "../models/recipe";
import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";

export default function DeleteRecipe({ recipeId }: { recipeId: string }) {
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
          <ModalBody>Are you sure you want to delete this recipe?</ModalBody>
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
      await fetch(buildRoute(`/api/recipes?id=${id}`), {
        method: "DELETE",
      });
    },
    {
      onMutate: async (id: string) => {
        await queryClient.cancelQueries("recipes");

        const previousRecipes = queryClient.getQueriesData(
          "recipes"
        ) as unknown as { recipes: Array<Recipe> };

        queryClient.setQueryData<{ recipes: Array<Recipe> }>(
          "recipes",
          (old) => ({ recipes: old?.recipes.filter((r) => r.id !== id) ?? [] })
        );
      },

      onSuccess: () => {
        queryClient.invalidateQueries("recipes");
      },

      onError: (err: any, newRecipes: any, context: any) => {
        queryClient.setQueryData("recipes", context.previousRecipes);
      },
    }
  );
}

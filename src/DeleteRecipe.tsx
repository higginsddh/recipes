import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQueryClient } from "react-query";
import { buildRoute } from "./buildRoute";
import IconButton from "./IconButton";
import { Recipe } from "../models/recipe";
import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";

type MutationResult = {
  previousRecipes: Array<Recipe>;
};

export default function DeleteRecipe({ recipeId }: { recipeId: string }) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const queryClient = useQueryClient();

  const mutation = useMutation(
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
        ) as unknown as Array<Recipe>;

        queryClient.setQueryData<Array<Recipe>>(
          "recipes",
          (old) => old?.filter((r) => r.id !== id) ?? []
        );

        return { previousRecipes } as MutationResult;
      },

      onSuccess: () => {
        queryClient.invalidateQueries("receipes");
      },

      onError: (err: any, newRecipes: any, context: any) => {
        queryClient.setQueryData("recipes", context.previousRecipes);
      },
    }
  );

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

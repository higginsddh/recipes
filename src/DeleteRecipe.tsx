import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQueryClient } from "react-query";
import { buildRoute } from "./buildRoute";
import IconButton from "./IconButton";
import { RecipesData } from "../models/recipesData";
import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";

type MutationResult = {
  previousRecipes: RecipesData;
};

export default function DeleteRecipe({ id }: { id: string }) {
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
        ) as unknown as RecipesData;

        queryClient.setQueryData<RecipesData>("recipes", (old) => ({
          recipes: old?.recipes.filter((r) => r.id !== id) ?? [],
        }));

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
      <IconButton>
        <FontAwesomeIcon
          icon={faTrash}
          title="Delete Receipt"
          className="ms-3"
          onClick={() => setShowConfirmation(true)}
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
                mutation.mutate(id);
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

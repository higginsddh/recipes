import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { Button, Input } from "reactstrap";
import { buildRoute } from "./buildRoute";
import { ShoppingListItem } from "../models/shoppingListItem";
import FullPageSpinner from "./FullPageSpinner";
import ShoppingListItemCreate from "./ShoppingListItemCreate";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { patchData } from "./services/httpUtilities";

type FormFields = {
  name: string;
  purchased: boolean;
};

export default function ShoppingListItemRow({
  shoppingListItem,
}: {
  shoppingListItem: ShoppingListItem;
}) {
  const queryClient = useQueryClient();
  const { register, getValues, watch } = useForm<FormFields>({
    defaultValues: {
      name: shoppingListItem.name,
      purchased: shoppingListItem.purchased,
    },
  });

  const { mutate: deleteShoppingListItem } =
    useDeleteShoppingListItem(queryClient);

  const { mutate: updateShoppingListItem } = useGetSaveMutation(
    shoppingListItem.id,
    queryClient
  );

  const purchased = watch("purchased");

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          updateShoppingListItem(getValues());
        }}
      >
        <div className="input-group mb-3">
          <div className="input-group-text">
            <input
              className="form-check-input mt-0"
              type="checkbox"
              value=""
              aria-label="Item purchased?"
              {...register("purchased")}
            />
          </div>
          <input
            className="form-control"
            {...register("name")}
            style={{ textDecoration: purchased ? "line-through" : undefined }}
          />
          <Button color="secondary" type="submit" className="me-3">
            <FontAwesomeIcon icon={faCheck} />
          </Button>
          <Button
            color="secondary"
            type="button"
            onClick={() => deleteShoppingListItem(shoppingListItem.id)}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      </form>
    </>
  );
}

function useGetSaveMutation(
  shoppingListItemId: string,
  queryClient: QueryClient
) {
  return useMutation(
    async (recipe: FormFields) => {
      const response = await patchData(
        `/api/recipes/${shoppingListItemId}`,
        recipe
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("shoppingListItems");
      },
      onError: (e) => console.error(JSON.stringify(e)),
    }
  );
}

function useDeleteShoppingListItem(queryClient: QueryClient) {
  return useMutation(
    async (id: string) => {
      await fetch(buildRoute(`/api/shoppingListItem?id=${id}`), {
        method: "DELETE",
      });
    },
    {
      onMutate: async (id: string) => {
        await queryClient.cancelQueries("shoppingListItems");

        const previousShoppingListItems = queryClient.getQueriesData(
          "shoppingListItems"
        ) as unknown as { shoppingListItems: Array<ShoppingListItem> };

        queryClient.setQueryData<{
          shoppingListItems: Array<ShoppingListItem>;
        }>("shoppingListItems", (old) => ({
          shoppingListItems:
            old?.shoppingListItems.filter((r) => r.id !== id) ?? [],
        }));

        return { previousShoppingListItems };
      },

      onSuccess: () => {
        queryClient.invalidateQueries("shoppingListItems");
      },

      onError: (err: any, newRecipes: any, context: any) => {
        queryClient.setQueryData(
          "shoppingListItems",
          context.previousShoppingListItems
        );
      },
    }
  );
}

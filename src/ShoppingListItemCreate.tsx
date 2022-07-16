import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import { Button, Input } from "reactstrap";
import { ShoppingListItem } from "../models/shoppingListItem";
import { executePost } from "./services/httpUtilities";
import React, { useState } from "react";
import { v4 } from "uuid";
import toast from "react-hot-toast";

export default function ShoppingListItemCreate() {
  const [name, setName] = useState("");

  const queryClient = useQueryClient();

  const { mutate: createShoppingListItem, isLoading: mutateIsSaving } =
    useCreateShoppingListItemMutation(queryClient, setName);

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();

          createShoppingListItem({
            id: v4(),
            name: name.trim(),
          });
        }}
      >
        <div className="input-group mb-3">
          <Input
            placeholder="Add item..."
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Button color="secondary">
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
      </form>
    </>
  );
}

function useCreateShoppingListItemMutation(
  queryClient: QueryClient,
  setName: React.Dispatch<React.SetStateAction<string>>
) {
  return useMutation(
    async (shoppingListItem: Pick<ShoppingListItem, "id" | "name">) => {
      await queryClient.cancelQueries(["shoppingListItems"]);

      const oldQueryData = queryClient.getQueriesData(["shoppingListItems"]);

      const response = await executePost(
        "/api/shoppingListItem",
        shoppingListItem
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return { previousShoppingListItems: oldQueryData[0][1] };
    },

    {
      onMutate: async (
        shoppingListItem: Pick<ShoppingListItem, "id" | "name">
      ) => {
        await queryClient.cancelQueries(["shoppingListItems"]);

        const oldQueryData = queryClient.getQueriesData(["shoppingListItems"]);

        queryClient.setQueryData<{
          shoppingListItems: Array<ShoppingListItem>;
        }>("shoppingListItems", (old) => ({
          shoppingListItems: [
            ...(old?.shoppingListItems ?? []),
            {
              purchased: false,
              quantity: 1,
              ...shoppingListItem,
            },
          ],
        }));

        setName("");

        return { previousShoppingListItems: oldQueryData[0][1] };
      },

      onSuccess: () => {},

      onSettled: () => {
        queryClient.invalidateQueries("shoppingListItems");
      },

      onError: (e, _, context) => {
        if (context?.previousShoppingListItems) {
          queryClient.setQueryData(
            ["shoppingListItems"],
            context.previousShoppingListItems
          );
        }

        toast.error("Unable to add item");

        console.error(JSON.stringify(e));
      },
    }
  );
}

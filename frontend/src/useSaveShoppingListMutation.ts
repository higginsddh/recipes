import toast from "react-hot-toast";
import { QueryClient, useMutation } from "@tanstack/react-query";
import { ShoppingListItem } from "../models/shoppingListItem";
import { executePatch } from "./services/httpUtilities";

export type SaveChangeArg = { id: string } & Partial<{
  name: string;
  purchased: boolean;
  order: number;
}>;

export function useSaveShoppingListMutation(
  queryClient: QueryClient,
  onMutateHandler?: (
    arg: SaveChangeArg
  ) => Promise<{ previousShoppingListItems: Array<ShoppingListItem> }>
) {
  return useMutation(
    async (shoppingListItem: SaveChangeArg) => {
      const response = await executePatch(
        `/api/ShoppingListItem/${shoppingListItem.id}`,
        shoppingListItem
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    },
    {
      onMutate: async (shoppingListItem: SaveChangeArg) => {
        if (onMutateHandler) {
          return await onMutateHandler(shoppingListItem);
        }
      },

      onSettled: () => {
        queryClient.invalidateQueries(["shoppingListItems"]);
      },

      onError: (e, _, context: any) => {
        console.error(JSON.stringify(e));
        toast.error("Unable to save change");

        if (context && context.previousShoppingListItems) {
          queryClient.setQueryData(
            ["shoppingListItems"],
            context.previousShoppingListItems
          );
        }
      },
    }
  );
}

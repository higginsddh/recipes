import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ShoppingListItem } from "../../models/shoppingListItem";
import { executePost } from "../services/httpUtilities";

export function useCreateShoppingListItemsMutation(
  setShowAddConfirmation: React.Dispatch<React.SetStateAction<boolean>>,
  setShowSpinner: React.Dispatch<React.SetStateAction<boolean>>
) {
  const queryClient = useQueryClient();
  return useMutation(
    async (shoppingListItems: Array<Partial<ShoppingListItem>>) => {
      setShowSpinner(true);

      const results = await Promise.all(
        shoppingListItems.map((i) => executePost("/api/shoppingListItem", i))
      );

      if (results.some((r) => !r.ok)) {
        throw new Error("Network response was not ok");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["shoppingListItems"]);
        setShowAddConfirmation(true);
        setShowSpinner(false);
      },

      onError: (e) => {
        console.error(JSON.stringify(e));
        setShowSpinner(false);
      },
    }
  );
}

import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import toast from "react-hot-toast";
import { ShoppingListItem } from "../../models/shoppingListItem";
import {
  executeDelete,
  executePatch,
  executePost,
} from "../services/httpUtilities";

const shoppingListItemsKeys = {
  all: ["shoppingListItems"] as const,
};

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
        queryClient.invalidateQueries(shoppingListItemsKeys.all);
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

export type SaveChangeArg = { id: string } & Partial<{
  name: string;
  purchased: boolean;
  order: number;
}>;

export function useSaveShoppingListMutation(
  onMutateHandler?: (
    arg: SaveChangeArg
  ) => Promise<{ previousShoppingListItems: Array<ShoppingListItem> }>
) {
  const queryClient = useQueryClient();
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
        queryClient.invalidateQueries(shoppingListItemsKeys.all);
      },

      onError: (e, _, context: any) => {
        console.error(JSON.stringify(e));
        toast.error("Unable to save change");

        if (context && context.previousShoppingListItems) {
          queryClient.setQueryData(
            shoppingListItemsKeys.all,
            context.previousShoppingListItems
          );
        }
      },
    }
  );
}

export function useCreateShoppingListItemMutation(
  setName: React.Dispatch<React.SetStateAction<string>>
) {
  const queryClient = useQueryClient();
  return useMutation(
    async (shoppingListItem: Pick<ShoppingListItem, "id" | "name">) => {
      await queryClient.cancelQueries(shoppingListItemsKeys.all);

      const oldQueryData = queryClient.getQueriesData(
        shoppingListItemsKeys.all
      );

      const response = await executePost("/api/shoppingListItem", {
        ...shoppingListItem,
        order: 0,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return { previousShoppingListItems: oldQueryData[0][1] };
    },

    {
      onMutate: async (
        shoppingListItem: Pick<ShoppingListItem, "id" | "name">
      ) => {
        await queryClient.cancelQueries(shoppingListItemsKeys.all);

        const oldQueryData = queryClient.getQueriesData(
          shoppingListItemsKeys.all
        );

        queryClient.setQueryData<{
          shoppingListItems: Array<ShoppingListItem>;
        }>(shoppingListItemsKeys.all, (old) => ({
          shoppingListItems: [
            {
              purchased: false,
              quantity: 1,
              order: 0,
              ...shoppingListItem,
            },
            ...(old?.shoppingListItems ?? []),
          ],
        }));

        setName("");

        return { previousShoppingListItems: oldQueryData[0][1] };
      },

      onSuccess: () => {},

      onSettled: () => {
        queryClient.invalidateQueries(shoppingListItemsKeys.all);
      },

      onError: (e, _, context) => {
        if (context?.previousShoppingListItems) {
          queryClient.setQueryData(
            shoppingListItemsKeys.all,
            context.previousShoppingListItems
          );
        }

        toast.error("Unable to add item");

        console.error(JSON.stringify(e));
      },
    }
  );
}

export function useDeleteShoppingListItem() {
  const queryClient = useQueryClient();
  return useMutation(
    async (ids: Array<string>) => {
      await executeDelete(`/api/shoppingListItem`, {
        ids,
      });
    },
    {
      onMutate: async (ids: Array<string>) => {
        await queryClient.cancelQueries(shoppingListItemsKeys.all);

        const oldQueryData = queryClient.getQueriesData(
          shoppingListItemsKeys.all
        );

        queryClient.setQueryData<{
          shoppingListItems: Array<ShoppingListItem>;
        }>(shoppingListItemsKeys.all, (old) => ({
          shoppingListItems:
            old?.shoppingListItems.filter((r) => !ids.includes(r.id)) ?? [],
        }));

        return { previousShoppingListItems: oldQueryData[0][1] };
      },

      onSettled: () => {
        queryClient.invalidateQueries(shoppingListItemsKeys.all);
      },

      onError: (err: any, newRecipes: any, context: any) => {
        queryClient.setQueryData(
          shoppingListItemsKeys.all,
          context.previousShoppingListItems
        );

        toast.error("Unable to delete item(s)");
        console.error(JSON.stringify(err));
      },
    }
  );
}

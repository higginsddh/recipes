import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { buildRoute } from "./buildRoute";
import { ShoppingListItem } from "../models/shoppingListItem";
import FullPageSpinner from "./FullPageSpinner";
import ShoppingListItemCreate from "./ShoppingListItemCreate";
import ShoppingListItemRow from "./ShoppingListItemRow";
import ErrorBoundary from "./ErrorBoundary";
import { Button } from "reactstrap";
import toast from "react-hot-toast";

export default function ShoppingList() {
  const queryClient = useQueryClient();

  const {
    isLoading,
    error,
    data: data,
  } = useQuery<{
    shoppingListItems: Array<ShoppingListItem>;
  }>("shoppingListItems", () =>
    fetch(buildRoute("/api/shoppingListItem")).then((res) => res.json())
  );

  const { mutate: deleteShoppingListItems } =
    useDeleteShoppingListItem(queryClient);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (error || !data) {
    console.error(error);
    return <div>An error has occurred</div>;
  }

  return (
    <div>
      <div className="d-block d-sm-flex">
        <div className="flex-grow-1">
          <ShoppingListItemCreate />
        </div>

        {data.shoppingListItems.some((li) => li.purchased) ? (
          <div className="ms-0 ms-sm-3 mb-3">
            <Button
              color="secondary"
              type="button"
              onClick={() => {
                deleteShoppingListItems(
                  data.shoppingListItems
                    .filter((li) => li.purchased)
                    .map((li) => li.id)
                );
              }}
            >
              Remove Checked Items
            </Button>
          </div>
        ) : null}
      </div>

      <ErrorBoundary errorMessage="Unable to load shopping list items">
        {data.shoppingListItems.map((i) => (
          <ShoppingListItemRow shoppingListItem={i} key={i.id} />
        ))}
      </ErrorBoundary>
    </div>
  );
}

function useDeleteShoppingListItem(queryClient: QueryClient) {
  return useMutation(
    async (ids: Array<string>) => {
      await fetch(buildRoute(`/api/shoppingListItem`), {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      });
    },
    {
      onMutate: async (ids: Array<string>) => {
        await queryClient.cancelQueries(["shoppingListItems"]);

        const oldQueryData = queryClient.getQueriesData(["shoppingListItems"]);

        queryClient.setQueryData<{
          shoppingListItems: Array<ShoppingListItem>;
        }>("shoppingListItems", (old) => ({
          shoppingListItems:
            old?.shoppingListItems.filter((r) => !ids.includes(r.id)) ?? [],
        }));

        return { previousShoppingListItems: oldQueryData[0][1] };
      },

      onSettled: () => {
        queryClient.invalidateQueries(["shoppingListItems"]);
      },

      onError: (err: any, newRecipes: any, context: any) => {
        queryClient.setQueryData(
          ["shoppingListItems"],
          context.previousShoppingListItems
        );

        toast.error("Unable to delete item(s)");
        console.error(JSON.stringify(err));
      },
    }
  );
}

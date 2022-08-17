import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { ShoppingListItem } from "../models/shoppingListItem";
import FullPageSpinner from "./FullPageSpinner";
import ShoppingListItemCreate from "./ShoppingListItemCreate";
import ShoppingListItemRow from "./ShoppingListItemRow";
import ErrorBoundary from "./ErrorBoundary";
import { Button } from "reactstrap";
import toast from "react-hot-toast";
import { executeDelete, executeGet } from "./services/httpUtilities";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import {
  SaveChangeArg,
  useSaveShoppingListMutation,
} from "./useSaveShoppingListMutation";

export default function ShoppingList() {
  const queryClient = useQueryClient();

  const {
    isLoading,
    error,
    data: data,
  } = useQuery<{
    shoppingListItems: Array<ShoppingListItem>;
  }>("shoppingListItems", () =>
    executeGet("/api/shoppingListItem").then((res) => res.json())
  );

  const { mutate: deleteShoppingListItems } =
    useDeleteShoppingListItem(queryClient);

  const { mutate: reorderShoppingListItems, isLoading: isSaving } =
    useSaveShoppingListMutation(queryClient, async (args) => {
      await queryClient.cancelQueries("shoppingListItems");

      const oldQueryData = queryClient.getQueriesData(["shoppingListItems"]);

      queryClient.setQueryData<{ shoppingListItems: Array<ShoppingListItem> }>(
        "shoppingListItems",
        (old) => {
          if (!old?.shoppingListItems) {
            return { shoppingListItems: [] };
          }

          const oldItemIndex = old.shoppingListItems.findIndex(
            (i) => i.id === args.id
          );
          if (oldItemIndex === -1) {
            return old;
          }

          if (typeof args.order !== "number") {
            console.log("order not number");
            return old;
          }

          return {
            shoppingListItems: reorder(
              old.shoppingListItems,
              oldItemIndex,
              args.order
            ),
          };
        }
      );

      return {
        previousShoppingListItems:
          oldQueryData[0][1] as Array<ShoppingListItem>,
      };
    });

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
        <DragDropContext
          onDragEnd={(result) => {
            reorderShoppingListItems({
              id: result.draggableId,
              order: result.destination?.index ?? 0,
            });
          }}
        >
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {data.shoppingListItems.map((i, index) => (
                  <ShoppingListItemRow
                    shoppingListItem={i}
                    key={i.id}
                    index={index}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </ErrorBoundary>
    </div>
  );
}

function useDeleteShoppingListItem(queryClient: QueryClient) {
  return useMutation(
    async (ids: Array<string>) => {
      await executeDelete(`/api/shoppingListItem`, {
        ids,
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

function reorder<T>(list: Array<T>, startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

import { faCheck, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
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
import { postData } from "./services/httpUtilities";
import React, { useState } from "react";

export default function ShoppingListItemCreate() {
  const [name, setName] = useState("");

  const queryClient = useQueryClient();

  const { mutate: createShoppingListItem, isLoading: mutateIsSaving } =
    useCreateShoppingListItemMutation(queryClient, setName);

  return (
    <>
      {mutateIsSaving ? <FullPageSpinner /> : null}
      <form
        onSubmit={(e) => {
          e.preventDefault();

          createShoppingListItem({
            name,
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
    async (shoppingListItem: Partial<ShoppingListItem>) => {
      const response = await postData(
        "/api/shoppingListItem",
        shoppingListItem
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("shoppingListItems");
        setName("");
      },
      onError: (e) => console.error(JSON.stringify(e)),
    }
  );
}

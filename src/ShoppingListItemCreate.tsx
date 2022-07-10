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
import React, { useRef, useState } from "react";

export default function ShoppingListItemCreate() {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { mutate: createShoppingListItem, isLoading: mutateIsSaving } =
    useCreateShoppingListItemMutation(queryClient, setName, inputRef);

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
          <input
            className="form-control"
            placeholder="Add item..."
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            disabled={mutateIsSaving}
            ref={inputRef}
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
  setName: React.Dispatch<React.SetStateAction<string>>,
  inputRef: React.RefObject<HTMLInputElement>
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

        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        });
      },
      onError: (e) => console.error(JSON.stringify(e)),
    }
  );
}

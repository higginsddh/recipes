import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Input } from "reactstrap";
import { useState } from "react";
import { v4 } from "uuid";
import { useCreateShoppingListItemMutation } from "./queries";

export default function ShoppingListItemCreate() {
  const [name, setName] = useState("");

  const { mutate: createShoppingListItem, isLoading: mutateIsSaving } =
    useCreateShoppingListItemMutation(setName);

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

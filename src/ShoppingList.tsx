import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "react-query";
import { Button, Input } from "reactstrap";
import { buildRoute } from "./buildRoute";
import { ShoppingListItem } from "../models/shoppingListItem";
import FullPageSpinner from "./FullPageSpinner";
import ShoppingListItemCreate from "./ShoppingListItemCreate";

export default function ShoppingList() {
  const {
    isLoading,
    error,
    data: data,
  } = useQuery<{
    shoppingListItems: Array<ShoppingListItem>;
  }>("shoppingListItems", () =>
    fetch(buildRoute("/api/shoppingListItem")).then((res) => res.json())
  );

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (error || !data) {
    console.error(error);
    return <div>An error has occurred</div>;
  }

  return (
    <div>
      <ShoppingListItemCreate />

      {data.shoppingListItems.map((i) => (
        <div className="input-group mb-3" key={i.id}>
          <div className="input-group-text">
            <input
              className="form-check-input mt-0"
              type="checkbox"
              value=""
              aria-label="Checkbox for following text input"
            />
          </div>
          <Input value={i.name} />
          <Button color="secondary" type="button" className="me-3">
            <FontAwesomeIcon icon={faCheck} />
          </Button>
          <Button color="secondary" type="button">
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        </div>
      ))}
    </div>
  );
}

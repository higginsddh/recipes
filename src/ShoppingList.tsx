import { faCheck, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "react-query";
import { Button, Input } from "reactstrap";
import { buildRoute } from "./buildRoute";
import { ShoppingListItem } from "../models/shoppingListItem";
import FullPageSpinner from "./FullPageSpinner";
import ShoppingListItemCreate from "./ShoppingListItemCreate";
import ShoppingListItemRow from "./ShoppingListItemRow";

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
        <ShoppingListItemRow shoppingListItem={i} key={i.id} />
      ))}
    </div>
  );
}

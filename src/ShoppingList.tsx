import { useQuery } from "react-query";
import { buildRoute } from "./buildRoute";
import { ShoppingListItem } from "../models/shoppingListItem";
import FullPageSpinner from "./FullPageSpinner";
import ShoppingListItemCreate from "./ShoppingListItemCreate";
import ShoppingListItemRow from "./ShoppingListItemRow";
import ErrorBoundary from "./ErrorBoundary";

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

      <ErrorBoundary errorMessage="Unable to load shopping list items">
        {data.shoppingListItems.map((i) => (
          <ShoppingListItemRow shoppingListItem={i} key={i.id} />
        ))}
      </ErrorBoundary>
    </div>
  );
}

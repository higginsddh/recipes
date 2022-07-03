import { useState } from "react";
import { Input } from "reactstrap";
import AddReceiptButton from "./AddRecipeButton";
import "./App.css";
import ReceipeList from "./RecipeList";

export default function Recipes() {
  const [searchFilter, setSearchFilter] = useState("");

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <div className="flex-fill me-4">
          <Input
            placeholder="Search..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.currentTarget.value)}
          />
        </div>
        <AddReceiptButton />
      </div>
      <ReceipeList searchFilter={searchFilter} />
    </>
  );
}

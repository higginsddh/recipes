import { useState } from "react";
import { Button } from "reactstrap";
import ReceipeForm from "./ReceipeForm";

export default function AddReceiptButton() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <Button onClick={() => setShowForm(true)} type="button">
        Add Recipe
      </Button>
      {showForm ? <ReceipeForm onClose={() => setShowForm(false)} /> : null}
    </>
  );
}

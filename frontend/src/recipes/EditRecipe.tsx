import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import IconButton from "../IconButton";
import ReceipeForm from "./ReceipeForm";

export default function EditRecipe({ recipeId }: { recipeId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <IconButton onClick={() => setIsFormOpen(true)}>
        <FontAwesomeIcon icon={faEdit} title="Edit Receipt" />
      </IconButton>
      {isFormOpen ? (
        <ReceipeForm recipeId={recipeId} onClose={() => setIsFormOpen(false)} />
      ) : null}
    </>
  );
}

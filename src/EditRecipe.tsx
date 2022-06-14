import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import IconButton from "./IconButton";
import ReceipeForm from "./ReceipeForm";

export default function EditRecipe({ recipeId }: { recipeId: string }) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <>
      <IconButton>
        <FontAwesomeIcon
          icon={faEdit}
          title="Edit Receipt"
          onClick={() => setIsFormOpen(true)}
        />
      </IconButton>
      {isFormOpen ? (
        <ReceipeForm recipeId={recipeId} onClose={() => setIsFormOpen(false)} />
      ) : null}
    </>
  );
}

import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IconButton from "../IconButton";
import { useState } from "react";
import { Button, Modal, ModalBody, ModalFooter } from "reactstrap";
import { useDeleteReceipe } from "./queries";

export default function DeleteRecipe({
  recipeId,
  title,
}: {
  recipeId: string;
  title: string;
}) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const mutation = useDeleteReceipe();

  return (
    <>
      <IconButton onClick={() => setShowConfirmation(true)}>
        <FontAwesomeIcon
          icon={faTrash}
          title="Delete Receipt"
          className="ps-3"
        />
      </IconButton>
      {showConfirmation ? (
        <Modal isOpen={true}>
          <ModalBody>
            Are you sure you want to delete{" "}
            <span className="fw-bold">{title}</span>?
          </ModalBody>
          <ModalFooter>
            <Button
              type="button"
              color="primary"
              className="mr-3"
              onClick={() => {
                mutation.mutate(recipeId);
                setShowConfirmation(false);
              }}
            >
              Yes
            </Button>
            <Button type="button" onClick={() => setShowConfirmation(false)}>
              No
            </Button>
          </ModalFooter>
        </Modal>
      ) : null}
    </>
  );
}

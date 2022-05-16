import { useMutation } from "react-query";
import {
  Button,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";
import { useForm } from "react-hook-form";

type FormPayload = {
  title: string;
  notes: string;
};

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

export default function ReceipeForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit } = useForm<FormPayload>();

  const mutation = useMutation(
    (recipe: FormPayload) => {
      return postData("/api/recipes", recipe);
    },
    {
      onSuccess: () => {
        onClose();
      },
      onError: (e) => console.error(e),
    }
  );

  return (
    <Modal isOpen={true}>
      <ModalHeader>Recipe</ModalHeader>
      <ModalBody>
        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          id="modalForm"
        >
          <FormGroup>
            <Label for="title">Title</Label>
            <input
              id="title"
              type="text"
              className="form-control"
              {...register("title")}
            />
          </FormGroup>
          <FormGroup>
            <Label for="notes">Notes</Label>
            <input
              id="notes"
              type="textarea"
              className="form-control"
              {...register("notes")}
            />
          </FormGroup>
        </form>
      </ModalBody>
      <ModalFooter>
        <Button type="submit" color="primary" form="modalForm">
          Save
        </Button>
        <Button type="button" color="secondary" onClick={() => onClose()}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

import { useState } from "react";
import { useMutation } from "react-query";
import {
  Button,
  Form,
  FormGroup,
  Input,
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

export default function ReceipeForm({ onClose }: { onClose: () => void }) {
  const { register, handleSubmit } = useForm<FormPayload>();

  const mutation = useMutation((recipe: FormPayload) => {
    return fetch("/api/recipes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipe),
    });
  });

  return (
    <Modal isOpen={true}>
      <ModalHeader>Recipe</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
          <FormGroup>
            <Label for="title">Title</Label>
            <Input id="title" type="text" {...register("title")} />
          </FormGroup>
          <FormGroup>
            <Label for="notes">Notes</Label>
            <Input id="notes" type="textarea" {...register("notes")} />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button type="button" color="primary" onClick={() => onClose()}>
          Save
        </Button>
        <Button type="button" color="secondary" onClick={() => onClose()}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

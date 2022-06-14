import { useMutation, useQuery, useQueryClient } from "react-query";
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
import { buildRoute } from "./buildRoute";
import { Recipe } from "../models/recipe";
import { useEffect, useRef } from "react";

type FormPayload = {
  title: string;
  notes: string;
};

async function postData(url = "", data = {}) {
  return await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

async function patchData(url = "", data = {}) {
  return await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export default function ReceipeForm({
  recipeId,
  onClose,
}: {
  recipeId?: string;
  onClose: () => void;
}) {
  const { register, handleSubmit, reset } = useForm<FormPayload>();
  const queryClient = useQueryClient();

  const {
    isLoading,
    error,
    data: defaultRecipeData,
  } = useQuery<Recipe>(["recipes", recipeId], () => {
    if (recipeId) {
      return fetch(buildRoute(`/api/recipes/${recipeId}`)).then((res) =>
        res.json()
      );
    } else {
      return Promise.resolve({
        title: "",
        notes: "",
      } as Recipe);
    }
  });

  const hasFormInitialized = useRef(false);

  useEffect(() => {
    if (!hasFormInitialized.current) {
      reset({
        title: defaultRecipeData?.title,
        notes: defaultRecipeData?.notes,
      });
      hasFormInitialized.current = true;
    }
  }, [defaultRecipeData]);

  const mutation = useMutation(
    async (recipe: FormPayload) => {
      let response;
      if (recipeId) {
        response = await patchData("/api/recipes", recipe);
      } else {
        response = await postData("/api/recipes", recipe);
      }

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("recipes");
        onClose();
      },
      onError: (e) => console.error(JSON.stringify(e)),
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
            <Label for="title" className="required">
              Title
            </Label>
            <input
              id="title"
              type="text"
              className="form-control"
              required
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

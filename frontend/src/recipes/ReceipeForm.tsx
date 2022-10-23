import { useQueryClient } from "@tanstack/react-query";
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
import { ErrorResponse } from "../../models/errorResponse";
import { useEffect, useRef, useState } from "react";
import FullPageSpinner from "../FullPageSpinner";
import { v4 as uuidv4 } from "uuid";
import { UploadedFile } from "../../models/uploadedFile";

import { Typeahead } from "react-bootstrap-typeahead";
import "react-bootstrap-typeahead/css/Typeahead.css";
import ReceipeFormIngredients from "./ReceipeFormIngredients";
import {
  useGetSaveMutation,
  useLoadRecipeData,
  useLoadTags,
  useUploadFileMutation,
} from "./queries";

export type RecipeFormFields = {
  title: string;
  notes: string;
  link: string;
  ingredients: Array<{ id: string; name: string }>;
};

export default function ReceipeForm({
  recipeId,
  onClose,
}: {
  recipeId?: string;
  onClose: () => void;
}) {
  const { register, handleSubmit, reset, control, setFocus } =
    useForm<RecipeFormFields>();
  const [files, setFiles] = useState<Array<UploadedFile>>([]);

  const [selectedTags, setSelectedTags] = useState<Array<{ name: string }>>([]);
  const [errorResponse, setErrorResponse] = useState<ErrorResponse | null>(
    null
  );

  const fileRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const { isLoading: isLoadingRecipeData, data: defaultRecipeData } =
    useLoadRecipeData(recipeId);
  const { isLoading: isLoadingTags, data: tags } = useLoadTags();

  const hasFormInitialized = useRef(false);

  useEffect(() => {
    if (!hasFormInitialized.current && !isLoadingRecipeData) {
      reset({
        title: defaultRecipeData?.title ?? "",
        notes: defaultRecipeData?.notes ?? "",
        link: defaultRecipeData?.link ?? "",
        ingredients: defaultRecipeData?.ingredients ?? [
          {
            id: uuidv4(),
            name: "",
          },
        ],
      });
      setFiles(defaultRecipeData?.files ?? []);
      setSelectedTags(
        defaultRecipeData?.tags?.filter((t) => (t?.name ?? "").trim()) ?? []
      );
      hasFormInitialized.current = true;
    }
  }, [defaultRecipeData, isLoadingRecipeData]);

  const hasSetFocus = useRef<boolean>(false);
  useEffect(() => {
    if (!recipeId && !hasSetFocus.current) {
      setTimeout(() => {
        setFocus("title");
      });
      hasSetFocus.current = true;
    }
  }, [recipeId]);

  const { mutate: saveForm, isLoading: mutateIsSaving } = useGetSaveMutation(
    recipeId,
    queryClient,
    setErrorResponse,
    onClose
  );

  const { mutate: uploadFile, isLoading: fileIsSaving } = useUploadFileMutation(
    setFiles,
    fileRef
  );

  if (isLoadingRecipeData || isLoadingTags) {
    return <FullPageSpinner />;
  }

  return (
    <>
      <Modal isOpen={true} scrollable>
        <ModalHeader toggle={() => onClose()}>Recipe</ModalHeader>
        <ModalBody>
          {mutateIsSaving || fileIsSaving ? <FullPageSpinner /> : null}
          <form
            onSubmit={handleSubmit((data) =>
              saveForm({
                ...data,
                files,
                tags: selectedTags,
              })
            )}
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
            <ReceipeFormIngredients control={control} register={register} />
            <FormGroup>
              <Label for="notes">Notes</Label>
              <input
                id="notes"
                type="textarea"
                className="form-control"
                {...register("notes")}
              />
            </FormGroup>
            {files.map((f) => (
              <FormGroup key={f.id}>
                <div>
                  <img src={f.url} width="250px" />
                </div>
                <Button
                  type="button"
                  className="mt-2"
                  size="sm"
                  onClick={() =>
                    setFiles((existingFiles) =>
                      existingFiles.filter(
                        (existingFile) => existingFile.id !== f.id
                      )
                    )
                  }
                >
                  Delete
                </Button>
              </FormGroup>
            ))}
            <FormGroup>
              <Label for="picture">Add Photo</Label>
              <input
                id="picture"
                type="file"
                className="form-control"
                ref={fileRef}
                accept="image/*"
                onChange={(e) => {
                  uploadFile((e as any).target.files);
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label htmlFor="tags">Tags</Label>
              <Typeahead
                id="tags"
                allowNew
                multiple
                options={
                  tags
                    ?.filter((t) => (t?.name ?? "").trim())
                    .map((t) => t.name) ?? []
                }
                defaultSelected={(selectedTags ?? []).map((t) => t.name)}
                onChange={(e) => {
                  setSelectedTags(
                    e.map((t) => ({
                      name: (t as any).label,
                    }))
                  );
                }}
              />
            </FormGroup>
            <FormGroup>
              <Label for="link">Link</Label>
              <input
                id="link"
                type="url"
                className="form-control"
                {...register("link")}
              />
            </FormGroup>
          </form>
        </ModalBody>
        <ModalFooter className="justify-content-between">
          <div className="text-danger">{errorResponse?.error}</div>
          <div>
            <Button
              type="submit"
              color="primary"
              form="modalForm"
              className="me-2"
            >
              Save
            </Button>
            <Button type="button" color="secondary" onClick={() => onClose()}>
              Cancel
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}

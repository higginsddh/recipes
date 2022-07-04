import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Control, useFieldArray, UseFormRegister } from "react-hook-form";
import { Button } from "reactstrap";
import { RecipeFormFields } from "./ReceipeForm";
import { v4 as uuidv4 } from "uuid";

export default function ReceipeFormIngredients({
  control,
  register,
}: {
  register: UseFormRegister<RecipeFormFields>;
  control: Control<RecipeFormFields>;
}) {
  const { fields, update, remove, insert } = useFieldArray({
    control,
    name: "ingredients",
  });

  return (
    <>
      <div>
        <label>Ingredients</label>
        {fields.map((field, index) => (
          <div className="input-group mb-3" key={field.id}>
            <input
              className="form-control"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insert(index + 1, {
                    id: uuidv4(),
                    name: "",
                  });
                }
              }}
              {...register(`ingredients.${index}.name`)}
            />
            <Button
              className="me-2"
              color="secondary"
              type="button"
              onClick={() =>
                insert(index + 1, {
                  id: uuidv4(),
                  name: "",
                })
              }
            >
              <FontAwesomeIcon icon={faPlus} />
            </Button>

            <Button
              color="secondary"
              type="button"
              onClick={() => {
                if (fields.length > 1) {
                  remove(index);
                } else {
                  update(index, {
                    ...field,
                    name: "",
                  });
                }
              }}
            >
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

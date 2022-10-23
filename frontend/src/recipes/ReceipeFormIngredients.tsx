import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Control,
  useFieldArray,
  UseFieldArrayInsert,
  UseFormRegister,
} from "react-hook-form";
import { Button } from "reactstrap";
import { RecipeFormFields } from "./ReceipeForm";
import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef } from "react";

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

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={containerRef}>
        <label>Ingredients</label>
        {fields.map((field, index) => (
          <div className="input-group mb-3" key={field.id}>
            <input
              className="form-control"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  insertNewItem(insert, index, containerRef);
                }
              }}
              {...register(getInputElementName(index))}
            />
            <Button
              className="me-2"
              color="secondary"
              type="button"
              onClick={() => insertNewItem(insert, index, containerRef)}
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
function insertNewItem(
  insert: UseFieldArrayInsert<RecipeFormFields, "ingredients">,
  index: number,
  containerDiv: React.RefObject<HTMLDivElement>
) {
  const newIndex = index + 1;
  insert(
    newIndex,
    {
      id: uuidv4(),
      name: "",
    },
    {
      shouldFocus: true,
    }
  );

  setTimeout(() => {
    const newInputCandidates = document.getElementsByName(
      getInputElementName(newIndex)
    );
    newInputCandidates.forEach((c) => {
      if (containerDiv.current && containerDiv.current.contains(c)) {
        c.scrollIntoView(true);
      }
    });
  });
}

function getInputElementName(index: number): `ingredients.${number}.name` {
  return `ingredients.${index}.name`;
}

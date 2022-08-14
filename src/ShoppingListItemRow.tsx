import { faSpinner, faUpDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQueryClient } from "react-query";
import { Button } from "reactstrap";
import { ShoppingListItem } from "../models/shoppingListItem";
import { useForm, UseFormSetValue } from "react-hook-form";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { debounceTime, Subject } from "rxjs";
import { Draggable } from "react-beautiful-dnd";
import { useSaveShoppingListMutation } from "./useSaveShoppingListMutation";

type FormFields = {
  name: string;
  purchased: boolean;
};

export default function ShoppingListItemRow({
  shoppingListItem,
  index,
}: {
  shoppingListItem: ShoppingListItem;
  index: number;
}) {
  const queryClient = useQueryClient();
  const { register, getValues, watch, setValue } = useForm<FormFields>({
    defaultValues: {
      name: shoppingListItem.name,
      purchased: shoppingListItem.purchased,
    },
  });

  const [nameHasFocus, setNameHasFocus] = useState(false);

  const { mutate: updateShoppingListItem, isLoading: isSaving } =
    useSaveShoppingListMutation(queryClient);

  const purchased = watch("purchased");

  const nameChange = useRef(new Subject<string>());
  useEffect(() => {
    let subscription = nameChange.current
      .pipe(debounceTime(150))
      .subscribe(() => {
        updateShoppingListItem({
          id: shoppingListItem.id,
          name: getValues("name"),
        });
      });

    return function cleanup() {
      subscription.unsubscribe();
    };
  }, []);

  const originalValues = useRef<ShoppingListItem>(shoppingListItem);
  useSyncFields(originalValues, shoppingListItem, setValue, nameHasFocus);

  return (
    <>
      <Draggable draggableId={shoppingListItem.id} index={index}>
        {(provided, snapshot) => (
          <div
            className="d-flex"
            ref={provided.innerRef}
            {...provided.draggableProps}
          >
            <div className="input-group mb-3">
              <div className="input-group-text">
                <input
                  className="form-check-input mt-0"
                  type="checkbox"
                  value=""
                  aria-label="Item purchased?"
                  {...register("purchased", {
                    onChange: () => {
                      updateShoppingListItem({
                        id: shoppingListItem.id,
                        purchased: getValues("purchased"),
                      });
                    },
                  })}
                />
              </div>
              <input
                className="form-control"
                onFocus={() => {
                  setNameHasFocus(true);
                }}
                {...register("name", {
                  onChange: () => {
                    nameChange.current.next(getValues("name").trim());
                  },
                  onBlur: () => {
                    setNameHasFocus(false);
                  },
                })}
                style={{
                  textDecoration: purchased ? "line-through" : undefined,
                }}
              />

              {isSaving ? (
                <Button color="secondary" type="button" disabled>
                  <FontAwesomeIcon icon={faSpinner} spin={true} />
                </Button>
              ) : null}
            </div>

            <div className="ms-2" {...provided.dragHandleProps}>
              <Button color="secondary" type="button" disabled>
                <FontAwesomeIcon icon={faUpDown} title="Move item" />
              </Button>
            </div>
          </div>
        )}
      </Draggable>
    </>
  );
}

function useSyncFields(
  originalValues: MutableRefObject<ShoppingListItem>,
  shoppingListItem: ShoppingListItem,
  setValue: UseFormSetValue<FormFields>,
  nameHasFocus: boolean
) {
  syncField(originalValues, shoppingListItem, setValue, "purchased");

  if (!nameHasFocus) {
    syncField(originalValues, shoppingListItem, setValue, "name");
  }
}

function syncField(
  originalValues: React.MutableRefObject<ShoppingListItem>,
  shoppingListItem: ShoppingListItem,
  setValue: UseFormSetValue<FormFields>,
  field: keyof ShoppingListItem & keyof FormFields
) {
  if (originalValues.current[field] !== shoppingListItem[field]) {
    setValue(field, shoppingListItem[field]);

    (originalValues.current as any)[field] = shoppingListItem[field];
  }
}

import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import { Button } from "reactstrap";
import { ShoppingListItem } from "../models/shoppingListItem";
import { useForm, UseFormSetValue } from "react-hook-form";
import { patchData } from "./services/httpUtilities";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";
import { debounceTime, Subject } from "rxjs";

type FormFields = {
  name: string;
  purchased: boolean;
};

export default function ShoppingListItemRow({
  shoppingListItem,
}: {
  shoppingListItem: ShoppingListItem;
}) {
  const queryClient = useQueryClient();
  const { register, getValues, watch, setValue } = useForm<FormFields>({
    defaultValues: {
      name: shoppingListItem.name,
      purchased: shoppingListItem.purchased,
    },
  });

  const { mutate: updateShoppingListItem, isLoading: isSaving } =
    useGetSaveMutation(shoppingListItem.id, queryClient);

  const purchased = watch("purchased");

  const nameChange = useRef(new Subject<string>());
  useEffect(() => {
    let subscription = nameChange.current
      .pipe(debounceTime(150))
      .subscribe(() => {
        updateShoppingListItem({
          name: getValues("name"),
        });
      });

    return function cleanup() {
      subscription.unsubscribe();
    };
  }, []);

  useSyncFields(shoppingListItem, setValue);

  return (
    <>
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
                  purchased: getValues("purchased"),
                });
              },
            })}
          />
        </div>
        <input
          className="form-control"
          {...register("name", {
            onChange: () => {
              nameChange.current.next(getValues("name").trim());
            },
          })}
          style={{ textDecoration: purchased ? "line-through" : undefined }}
        />
        {isSaving ? (
          <Button color="secondary" type="button" disabled>
            <FontAwesomeIcon icon={faSpinner} spin={true} />
          </Button>
        ) : null}
      </div>
    </>
  );
}

function useSyncFields(
  shoppingListItem: ShoppingListItem,
  setValue: UseFormSetValue<FormFields>
) {
  const originalValues = useRef<ShoppingListItem>(shoppingListItem);
  syncField(originalValues, shoppingListItem, setValue, "name");
  syncField(originalValues, shoppingListItem, setValue, "purchased");
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

function useGetSaveMutation(
  shoppingListItemId: string,
  queryClient: QueryClient
) {
  return useMutation(
    async (shoppingListItem: Partial<FormFields>) => {
      const response = await patchData(
        `/api/ShoppingListItem/${shoppingListItemId}`,
        shoppingListItem
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("shoppingListItems");
      },
      onError: (e) => {
        toast.error("Unable to save change");
        console.error(JSON.stringify(e));
      },
    }
  );
}

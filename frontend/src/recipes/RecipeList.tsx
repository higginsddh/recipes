import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardBody, CardTitle, Badge, Button, Alert } from "reactstrap";
import { v4 } from "uuid";
import { Recipe } from "@models/recipe";
import DeleteRecipe from "./DeleteRecipe";
import EditRecipe from "./EditRecipe";
import FullPageSpinner from "../FullPageSpinner";
import { executeGet } from "../services/httpUtilities";
import { useCreateShoppingListItemsMutation } from "../shoppingList/queries";

export default function ReceipeList({
  searchFilter,
}: {
  searchFilter: string;
}) {
  const { isLoading, error, data } = useQuery<{ recipes: Array<Recipe> }>(
    ["recipes"],
    () => executeGet("/api/recipes").then((res) => res.json())
  );

  const [showAddConfirmation, setShowAddConfirmation] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const { mutate: createShoppingListItems } =
    useCreateShoppingListItemsMutation(setShowAddConfirmation, setShowSpinner);

  useEffect(() => {
    let id: any | null = null;
    if (showAddConfirmation) {
      id = setTimeout(() => {
        setShowAddConfirmation(false);
      }, 5000);
    }

    return function cleanup() {
      if (id) {
        clearTimeout(id);
      }
    };
  }, [showAddConfirmation]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (error) {
    console.error(error);
    return <div>An error has occurred</div>;
  }

  return (
    <>
      {showSpinner ? <FullPageSpinner /> : null}

      {showAddConfirmation ? (
        <Alert color="success" toggle={() => setShowAddConfirmation(false)}>
          Items added!
        </Alert>
      ) : null}

      {(data?.recipes ?? [])
        .sort((a, b) => {
          const normalizedATitle = a.title.toLowerCase();
          const normalizedBTitle = b.title.toLowerCase();
          if (normalizedATitle < normalizedBTitle) {
            return -1;
          } else if (normalizedATitle > normalizedBTitle) {
            return 1;
          } else {
            return 0;
          }
        })
        .filter((r) => isSearchMatch(searchFilter, r))
        .map((r) => (
          <Card key={r.id} className="mb-3">
            <CardBody>
              <CardTitle tag="h5">
                <div className="d-flex justify-content-between">
                  <div className="d-flex">
                    {r.link ? (
                      <div>
                        <a href={r.link} target="_blank">
                          {r.title}
                        </a>
                      </div>
                    ) : (
                      r.title
                    )}

                    {(r.files ?? []).length > 0 ? (
                      <div className="ms-2 d-flex">
                        {(r.files ?? []).map((file) => (
                          <div key={file.id} className="me-3">
                            <a href={file.url} target="_blank">
                              <FontAwesomeIcon icon={faImage} size="lg" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="d-flex flex-nowrap align-items-start">
                    <EditRecipe recipeId={r.id} />
                    <DeleteRecipe recipeId={r.id} title={r.title} />
                  </div>
                </div>
              </CardTitle>
              <div className="card-text">
                <div className="d-flex justify-content-between">
                  <div>
                    <div>{r.notes}</div>
                    {(r.tags ?? []).length > 0 ? (
                      <div className="mt-2 d-flex">
                        {r.tags
                          ?.filter((t) => (t?.name ?? "").trim())
                          .map((t, index) => (
                            <Badge
                              color="info"
                              pill
                              key={`${t.name}_${index}`}
                              className="me-2"
                            >
                              {t.name}
                            </Badge>
                          ))}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    {(r.ingredients ?? []).length > 0 ? (
                      <Button
                        type="button"
                        color="secondary"
                        size="sm"
                        onClick={() => {
                          createShoppingListItems(
                            (r.ingredients ?? []).map((i) => ({
                              id: v4(),
                              name: i.name,
                            }))
                          );
                        }}
                      >
                        Add To Shopping List
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
    </>
  );
}

function isSearchMatch(searchFilter: string, recipe: Recipe) {
  if (searchFilter.trim() === "") {
    return true;
  }

  return (
    containsTerm(searchFilter, recipe.title) ||
    containsTerm(searchFilter, recipe.notes) ||
    recipe.tags?.some((t) => containsTerm(searchFilter, t.name)) ||
    recipe.fileSearchTerms?.some((t) => containsTerm(searchFilter, t.text))
  );
}

function containsTerm(searchTerm: string, inputToCheck: string | null) {
  inputToCheck = inputToCheck ?? "";

  return inputToCheck.toLowerCase().includes(searchTerm.toLowerCase());
}

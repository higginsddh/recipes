import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "react-query";
import { Card, CardBody, CardTitle, CardText, Badge, Button } from "reactstrap";
import { v4 } from "uuid";
import { Recipe } from "../models/recipe";
import { ShoppingListItem } from "../models/shoppingListItem";
import { buildRoute } from "./buildRoute";
import DeleteRecipe from "./DeleteRecipe";
import EditRecipe from "./EditRecipe";
import FullPageSpinner from "./FullPageSpinner";
import { postData } from "./services/httpUtilities";

export default function ReceipeList({
  searchFilter,
}: {
  searchFilter: string;
}) {
  const { isLoading, error, data } = useQuery<{ recipes: Array<Recipe> }>(
    "recipes",
    () => fetch(buildRoute("/api/recipes")).then((res) => res.json())
  );

  const queryClient = useQueryClient();
  const { mutate: createShoppingListItems } =
    useCreateShoppingListItemsMutation(queryClient);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (error) {
    console.error(error);
    return <div>An error has occurred</div>;
  }

  return (
    <>
      {(data?.recipes ?? [])
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
                          Linked recipe
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
                    <DeleteRecipe recipeId={r.id} />
                  </div>
                </div>
              </CardTitle>
              <div className="card-text">
                <div className="d-flex justify-content-between">
                  <div>
                    <div>{r.notes}</div>
                    {(r.tags ?? []).length > 0 ? (
                      <div className="mt-2 d-flex">
                        {r.tags?.map((t) => (
                          <Badge
                            color="info"
                            pill
                            key={t.name}
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

function useCreateShoppingListItemsMutation(queryClient: QueryClient) {
  return useMutation(
    async (shoppingListItems: Array<Partial<ShoppingListItem>>) => {
      const results = await Promise.all(
        shoppingListItems.map((i) => postData("/api/shoppingListItem", i))
      );

      if (results.some((r) => !r.ok)) {
        throw new Error("Network response was not ok");
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("shoppingListItems");
      },

      onError: (e) => console.error(JSON.stringify(e)),
    }
  );
}

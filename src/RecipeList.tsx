import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
import { Recipe } from "../models/recipe";
import { buildRoute } from "./buildRoute";
import IconButton from "./IconButton";

type RecipesData = {
  recipes: Array<
    {
      id: string;
    } & Recipe
  >;
};

type MutationResult = {
  previousRecipes: RecipesData;
};

export default function ReceipeList() {
  const { isLoading, error, data } = useQuery<RecipesData>("recipes", () =>
    fetch(buildRoute("/api/recipes")).then((res) => res.json())
  );

  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (id: string) => {
      await fetch(buildRoute(`/api/recipes?id=${id}`), {
        method: "DELETE",
      });
    },
    {
      onMutate: async (id: string) => {
        await queryClient.cancelQueries("recipes");

        const previousRecipes = queryClient.getQueriesData(
          "recipes"
        ) as unknown as RecipesData;

        queryClient.setQueryData<RecipesData>("recipes", (old) => ({
          recipes: old?.recipes.filter((r) => r.id !== id) ?? [],
        }));

        return { previousRecipes } as MutationResult;
      },

      onSuccess: () => {
        queryClient.invalidateQueries("receipes");
      },

      onError: (err: any, newRecipes: any, context: any) => {
        queryClient.setQueryData("recipes", context.previousRecipes);
      },
    }
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error(error);
    return <div>"An error has occurred"</div>;
  }

  return (
    <>
      {(data?.recipes ?? []).map((r) => (
        <Card key={r.id} className="mb-3">
          <CardBody>
            <CardTitle tag="h5">
              <div className="d-flex justify-content-between">
                <div>{r.title}</div>
                <div>
                  <IconButton>
                    <FontAwesomeIcon icon={faEdit} title="Edit Receipt" />
                  </IconButton>
                  <IconButton>
                    <FontAwesomeIcon
                      icon={faTrash}
                      title="Delete Receipt"
                      className="ms-3"
                      onClick={() => mutation.mutate(r.id)}
                    />
                  </IconButton>
                </div>
              </div>
            </CardTitle>
            <CardText>{r.notes}</CardText>
          </CardBody>
        </Card>
      ))}
    </>
  );
}

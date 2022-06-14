import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
import { RecipesData } from "../models/recipesData";
import { buildRoute } from "./buildRoute";
import DeleteRecipe from "./DeleteRecipe";
import EditRecipe from "./EditRecipe";
import IconButton from "./IconButton";

export default function ReceipeList() {
  const { isLoading, error, data } = useQuery<RecipesData>("recipes", () =>
    fetch(buildRoute("/api/recipes")).then((res) => res.json())
  );

  const queryClient = useQueryClient();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    console.error(error);
    return <div>An error has occurred</div>;
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
                  <EditRecipe recipeId={r.id} />
                  <DeleteRecipe recipeId={r.id} />
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

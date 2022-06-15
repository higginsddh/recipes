import { useQuery } from "react-query";
import { Card, CardBody, CardTitle, CardText, CardFooter } from "reactstrap";
import { RecipesData } from "../models/recipesData";
import { buildRoute } from "./buildRoute";
import DeleteRecipe from "./DeleteRecipe";
import EditRecipe from "./EditRecipe";
import FullPageSpinner from "./FullPageSpinner";

export default function ReceipeList() {
  const { isLoading, error, data } = useQuery<RecipesData>("recipes", () =>
    fetch(buildRoute("/api/recipes")).then((res) => res.json())
  );

  if (isLoading) {
    return <FullPageSpinner />;
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
            <CardText>
              {r.notes}
              <br />
              {r.link ? (
                <a href={r.link} target="_blank">
                  Linked recipe
                </a>
              ) : null}
              <br />
              {r.picture ? (
                <a href={r.picture} target="_blank">
                  Picture
                </a>
              ) : null}
            </CardText>
          </CardBody>
        </Card>
      ))}
    </>
  );
}

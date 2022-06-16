import { faImage } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
                <div>
                  {r.link ? (
                    <div>
                      <a href={r.link} target="_blank">
                        Linked recipe
                      </a>
                    </div>
                  ) : (
                    r.title
                  )}
                </div>
                <div>
                  <EditRecipe recipeId={r.id} />
                  <DeleteRecipe recipeId={r.id} />
                </div>
              </div>
            </CardTitle>
            <div className="card-text">
              <div>{r.notes}</div>
              {(r.files ?? []).length > 0 ? (
                <div className="d-flex">
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
          </CardBody>
        </Card>
      ))}
    </>
  );
}

import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
import IconButton from "./IconButton";

export default function ReceipeList() {
  const [recipes, setRecipes] = useState<
    Array<{ id: string; title: string; notes: string }>
  >([]);

  useEffect(() => {
    fetch("/api/recipes").then((r) =>
      r.json().then((r) => setRecipes(r.recipes as any))
    );
  }, []);

  return (
    <>
      {recipes.map((r) => (
        <Card key={r.id}>
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

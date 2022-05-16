import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "react-query";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
import IconButton from "./IconButton";

export default function ReceipeList() {
  const { isLoading, error, data } = useQuery<{
    recipes: Array<{ id: string; title: string; notes: string }>;
  }>("recipes", () => fetch("/api/recipes").then((res) => res.json()));

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

import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";

export default function ReceipeList() {
  const recipes = [
    {
      id: "1",
      title: "Carne asado tacos",
      notes: "Test notes",
      tags: [],
      img: null,
    },
  ];

  return (
    <>
      {recipes.map((r) => (
        <Card>
          <CardBody>
            <CardTitle tag="h5">
              <div className="d-flex justify-content-between">
                <div>{r.title}</div>
                <div>
                  <FontAwesomeIcon icon={faEdit} />
                  <FontAwesomeIcon icon={faTrash} className="ms-3" />
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

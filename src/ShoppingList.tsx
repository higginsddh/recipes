import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Input } from "reactstrap";

export default function ShoppingList() {
  return (
    <div>
      <div className="input-group">
        <Input placeholder="Add item..." />
        <Button color="secondary">
          <FontAwesomeIcon icon={faCheck} />
        </Button>
      </div>
    </div>
  );
}

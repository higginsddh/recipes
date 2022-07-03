import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Input } from "reactstrap";

export default function ShoppingList() {
  const items = [
    {
      id: "i-1",
      text: "Apples",
    },
    {
      id: "i-2",
      text: "Bananas",
    },
  ];
  return (
    <div>
      <div className="input-group">
        <Input placeholder="Add item..." />
        <Button color="secondary">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      </div>

      {items.map((i) => (
        <div className="input-group">
          <div className="input-group-text">
            <input
              className="form-check-input mt-0"
              type="checkbox"
              value=""
              aria-label="Checkbox for following text input"
            />
          </div>
          <Input placeholder="Add item..." />
          <Button color="secondary">
            <FontAwesomeIcon icon={faPlus} />
          </Button>
        </div>
      ))}
    </div>
  );
}

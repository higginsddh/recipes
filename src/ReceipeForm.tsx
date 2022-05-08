import {
  Button,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "reactstrap";

export default function ReceipeForm({ onClose }: { onClose: () => void }) {
  return (
    <Modal isOpen={true}>
      <ModalHeader>Recipe</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="title">Title</Label>
            <Input id="title" type="text" />
          </FormGroup>
          <FormGroup>
            <Label for="notes">Notes</Label>
            <Input id="notes" type="textarea" />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button type="button" color="primary" onClick={() => onClose()}>
          Save
        </Button>
        <Button type="button" color="secondary" onClick={() => onClose()}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

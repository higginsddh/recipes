import { Navbar, NavbarBrand } from "reactstrap";
import "./App.css";
import ReceipeList from "./RecipeList";

export default function App() {
  return (
    <>
      <Navbar color="light" expand="md" light>
        <NavbarBrand href="/">Recipes</NavbarBrand>
      </Navbar>
      <div className="container mt-5">
        <ReceipeList />
      </div>
    </>
  );
}

import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarText,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown,
} from "reactstrap";
import "./App.css";
import { QueryClient, QueryClientProvider } from "react-query";
import { Link } from "react-router-dom";

export default function AppNavbar() {
  return (
    <Navbar color="light" expand="md" light>
      <Link to="/" className="navbar-brand">
        Food Organizer
      </Link>
      <NavbarToggler onClick={function noRefCheck() {}} />
      <Collapse navbar>
        <Nav className="me-auto" navbar>
          <NavItem>
            <Link to="/" className="nav-link">
              Shopping List
            </Link>
          </NavItem>
          <NavItem>
            <Link to="/recipes" className="nav-link">
              Recipes
            </Link>
          </NavItem>
        </Nav>
      </Collapse>
    </Navbar>
  );
}

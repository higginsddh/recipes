import { Collapse, Nav, Navbar, NavbarToggler, NavItem } from "reactstrap";
import "./App.css";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function AppNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Navbar color="light" expand="md" light>
      <Link to="/" className="navbar-brand">
        Food Organizer
      </Link>
      <NavbarToggler onClick={() => setIsOpen(!isOpen)} />
      <Collapse isOpen={isOpen} navbar>
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

import { Navbar, NavbarBrand } from "reactstrap";
import "./App.css";
import { QueryClient, QueryClientProvider } from "react-query";
import Recipes from "./Recipes";

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Navbar color="light" expand="md" light>
          <NavbarBrand href="/">Recipes</NavbarBrand>
        </Navbar>
        <div className="container mt-4">
          <Recipes />
        </div>
      </QueryClientProvider>
    </>
  );
}

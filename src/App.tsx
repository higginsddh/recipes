import { Navbar, NavbarBrand } from "reactstrap";
import AddReceiptButton from "./AddRecipeButton";
import "./App.css";
import ReceipeList from "./RecipeList";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Navbar color="light" expand="md" light>
          <NavbarBrand href="/">Recipes</NavbarBrand>
        </Navbar>
        <div className="container mt-5">
          <div className="d-flex justify-content-end mb-3">
            <AddReceiptButton />
          </div>
          <ReceipeList />
        </div>
      </QueryClientProvider>
    </>
  );
}

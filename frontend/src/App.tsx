import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Recipes from "./Recipes";
import AppNavbar from "./AppNavbar";
import { Routes, Route } from "react-router-dom";
import ShoppingList from "./ShoppingList";
import { Toaster } from "react-hot-toast";
import RealTimeWrapper from "./RealTimeWrapper";

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <RealTimeWrapper>
          <AppNavbar />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<ShoppingList />} />
              <Route path="/recipes" element={<Recipes />} />
            </Routes>
          </div>
        </RealTimeWrapper>
      </QueryClientProvider>
    </>
  );
}

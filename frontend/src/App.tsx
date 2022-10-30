import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Recipes from "./recipes/Recipes";
import AppNavbar from "./AppNavbar";
import { Routes, Route } from "react-router-dom";
import ShoppingList from "./shoppingList/ShoppingList";
import { Toaster } from "react-hot-toast";
import RealTimeWrapper from "./RealTimeWrapper";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import {
  persistQueryClient,
  PersistQueryClientProvider,
} from "@tanstack/react-query-persist-client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      cacheTime: 1000 * 60 * 60 * 24 * 365, // 1 year
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
});
// const sessionStoragePersister = createSyncStoragePersister({ storage: window.sessionStorage })

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
});

export default function App() {
  return (
    <>
      <Toaster />
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: localStoragePersister }}
      >
        <RealTimeWrapper>
          <AppNavbar />
          <div className="container mt-4">
            <Routes>
              <Route path="/" element={<ShoppingList />} />
              <Route path="/recipes" element={<Recipes />} />
            </Routes>
          </div>
        </RealTimeWrapper>
      </PersistQueryClientProvider>
    </>
  );
}

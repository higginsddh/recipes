import { CosmosClient, Container } from "@azure/cosmos";

let container: Container | null = null;

export async function getContainer() {
  if (container) {
    return container;
  }

  const client = new CosmosClient(process?.env?.CONNECTION_STRING ?? "");
  const { database } = await client.databases.createIfNotExists({
    id: "RestaurantTracker",
  });
  const r = await database.containers.createIfNotExists({
    id: "Recipes",
  });
  container = r.container;

  return container;
}

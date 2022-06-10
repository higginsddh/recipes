import { CosmosClient, Container } from "@azure/cosmos";

let container: Container | null = null;

export async function getContainer() {
  if (container) {
    return container;
  }

  console.log("test");
  console.log(process.env.CONNECTION_STRING);
  const client = new CosmosClient(process.env.CONNECTION_STRING);
  const { database } = await client.databases.createIfNotExists({
    id: "RestaurantTracker",
  });
  const r = await database.containers.createIfNotExists({
    id: "Recipes",
  });
  container = r.container;

  return container;
}

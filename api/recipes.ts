import { VercelRequest, VercelResponse } from "@vercel/node";
import { CosmosClient } from "@azure/cosmos";
import { uuid } from "uuidv4";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  switch (request.method) {
    case "GET":
      return await getRecipes(request, response);
    case "POST":
      return await createRecipe(request, response);
    default:
      return response.status(405);
  }
}

async function getRecipes(request: VercelRequest, response: VercelResponse) {
  const container = await getContainer();
  const recipes = (await container.items.readAll().fetchAll()).resources;

  const data = { recipes };
  return response.status(200).json(data);
}

async function createRecipe(request: VercelRequest, response: VercelResponse) {
  const container = await getContainer();
  await container.items.create({
    ...request.body,
    id: uuid(),
  });
}

export async function getContainer() {
  const client = new CosmosClient(process.env.COSMOS_CONNETION);
  const { database } = await client.databases.createIfNotExists({
    id: "Recipes",
  });
  const { container } = await database.containers.createIfNotExists({
    id: "Recipes",
  });

  return container;
}

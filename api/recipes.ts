import { VercelRequest, VercelResponse } from "@vercel/node";
import { CosmosClient } from "@azure/cosmos";
import { uuid } from "uuidv4";
import { Recipe } from "../models/recipe";

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  switch (request.method) {
    case "GET":
      return await getRecipes(request, response);
    case "POST":
      return await createRecipe(request, response);
    case "DELETE":
      return await deleteRecipe(request, response);
    default:
      return response.status(405);
  }
}

async function getRecipes(request: VercelRequest, response: VercelResponse) {
  const container = await getContainer();
  const recipes = (await container.items.readAll().fetchNext()).resources;

  const data = { recipes };
  return response.status(200).json(data);
}

async function createRecipe(request: VercelRequest, response: VercelResponse) {
  const container = await getContainer();

  const body = request.body as Recipe;
  if (!(body.title ?? "").trim()) {
    return response.status(400).json({
      error: "Title is required",
    });
  }

  await container.items.create({
    ...request.body,
    id: uuid(),
  });

  return response.status(200).json({});
}

async function deleteRecipe(request: VercelRequest, response: VercelResponse) {
  const id = request.query["id"] as string;

  const container = await getContainer();
  await container.item(id).delete();

  return response.status(200).json({});
}

export async function getContainer() {
  const client = new CosmosClient(process.env.COSMOS_CONNETION);
  const database = client.database("Recipes");
  const container = database.container("Recipes");

  return container;
}

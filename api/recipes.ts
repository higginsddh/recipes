import { VercelRequest, VercelResponse } from "@vercel/node";
import { uuid } from "uuidv4";
import { Recipe } from "../models/recipe";
import { db } from "./lib/prisma";

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
  const recipes = await db.recipe.findMany({});

  const data = { recipes };
  return response.status(200).json(data);
}

async function createRecipe(request: VercelRequest, response: VercelResponse) {
  const body = request.body as Recipe;
  if (!(body.title ?? "").trim()) {
    return response.status(400).json({
      error: "Title is required",
    });
  }

  await db.recipe.create({
    data: {
      title: body.title,
      notes: body.notes,
    },
  });

  return response.status(200).json({});
}

async function deleteRecipe(request: VercelRequest, response: VercelResponse) {
  const id = parseInt(request.query["id"] as string);

  await db.recipe.delete({
    where: {
      id: id,
    },
  });

  return response.status(200).json({});
}

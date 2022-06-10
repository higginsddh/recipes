import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer } from "../dbService";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");

  switch (req.method) {
    case "GET":
      await getRecipes(req, context);
    case "POST":
      await createRecipe(req, context);
    case "DELETE":
      await deleteRecipe(req, context);
    default:
      context.res = {
        status: 405,
      };
  }
};

export default httpTrigger;

async function getRecipes(request: HttpRequest, context: Context) {
  const container = await getContainer();
  const { resources: recipes } = await container.items
    .query("SELET * FROM c")
    .fetchAll();

  const data = { recipes };
  context.res = {
    body: data,
  };
}

async function createRecipe(request: HttpRequest, context: Context) {
  const body = request.body as any;
  if (!(body.title ?? "").trim()) {
    context.res = {
      status: 400,
      body: {
        error: "Title is required",
      },
    };
    return;
  }

  const container = await getContainer();
  await container.items.create(body);
}

async function deleteRecipe(request: HttpRequest, context: Context) {
  const id = request.query["id"];

  const container = await getContainer();
  await container.item(id).delete();
}

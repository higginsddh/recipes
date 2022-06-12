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
      return;
    case "POST":
      await createRecipe(req, context);
      return;
    case "PATCH":
      await updateRecipe(req, context);
      return;
    case "DELETE":
      await deleteRecipe(req, context);
      return;
    default:
      context.res = {
        status: 405,
      };
      return;
  }
};

export default httpTrigger;

async function getRecipes(request: HttpRequest, context: Context) {
  const container = await getContainer();

  const id = request.query["id"];
  if (id) {
    const recipe = await container.item(id).read();
    context.res = {
      body: recipe,
    };
  } else {
    const { resources: recipes } = await container.items
      .query("SELECT * FROM c")
      .fetchAll();

    const data = { recipes };
    context.res = {
      body: data,
    };
  }
}

async function updateRecipe(request: HttpRequest, context: Context) {
  const id = request.query["id"];
  const body = request.body as any;

  const container = await getContainer();
  await container.item(id).patch({
    operations: [
      {
        op: "replace",
        path: "/title",
        value: body.title,
      },
      {
        op: "replace",
        path: "/notes",
        value: body.notes,
      },
    ],
  });
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

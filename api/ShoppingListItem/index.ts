import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer } from "../dbService";
import { CosmosShoppingListItem } from "../cosmosModel/cosmosShoppingListItem";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");
  switch (req.method) {
    case "GET":
      await getShoppingList(req, context);
      return;
    case "POST":
      await createShoppingListeItem(req, context);
      return;
    case "PATCH":
      await updateShoppingListItem(req, context);
      return;
    case "DELETE":
      await deleteShoppingListItem(req, context);
      return;
    default:
      context.res = {
        status: 405,
      };
      return;
  }
};

export default httpTrigger;

async function getShoppingList(request: HttpRequest, context: Context) {
  const container = await getContainer();

  const id = request.params.id;
  if (id) {
    const shoppingListItem = await container.item(id).read();
    context.res = {
      body: shoppingListItem.resource,
    };
  } else {
    const { resources } = await container.items
      .query("SELECT * FROM c WHERE c.type = 'shoppinglistitem'")
      .fetchAll();

    const shoppingListItems = resources as Array<CosmosShoppingListItem>;

    const data = { shoppingListItems };
    context.res = {
      body: data,
    };
  }
}

async function updateShoppingListItem(request: HttpRequest, context: Context) {
  const id = request.params.id;
  const body = request.body as any;

  const container = await getContainer();
  const { resource: originalShoppingListItem } = await container
    .item(id)
    .read();

  await container.item(id).replace({
    ...originalShoppingListItem,
    ...body,
  } as CosmosShoppingListItem);
}

async function createShoppingListeItem(request: HttpRequest, context: Context) {
  const body = request.body as any;
  if (!(body.name ?? "").trim()) {
    context.res = {
      status: 400,
      body: {
        error: "Name is required",
      },
    };
    return;
  }

  const container = await getContainer();

  await container.items.create({
    ...body,
    type: "shoppinglistitem",
  });
}

async function deleteShoppingListItem(request: HttpRequest, context: Context) {
  const id = request.query["id"];

  const container = await getContainer();
  await container.item(id).delete();
}

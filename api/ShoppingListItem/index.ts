import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer } from "../dbService";
import { CosmosShoppingListItem } from "../cosmosModel/cosmosShoppingListItem";
import { Container } from "@azure/cosmos";

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

      setSignalRMessageToShoppingListItemsChanged(context);

      return;
    case "PATCH":
      await updateShoppingListItem(req, context);

      setSignalRMessageToShoppingListItemsChanged(context);

      return;
    case "DELETE":
      await deleteShoppingListItem(req, context);

      setSignalRMessageToShoppingListItemsChanged(context);

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

    const data = {
      shoppingListItems: shoppingListItems.sort(getSortFunction),
    };

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

  if (originalShoppingListItem.order !== body.order) {
    if (typeof body.order === "number") {
      incrementOrder(container, body.order);
    }

    if (typeof originalShoppingListItem.order === "number") {
      decrementOrder(container, originalShoppingListItem.order);
    }
  }

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

  if (typeof body.order === "number") {
    await incrementOrder(container, body.order);
  }

  await container.items.create({
    ...body,
    type: "shoppinglistitem",
  });
}

async function updateOrder(
  container: Container,
  order: number,
  filterExpression: ">=" | "<=",
  incrementValue: number
) {
  const { resources: itemsToIncrement } = await container.items
    .query(
      `SELECT c.Id FROM c WHERE c.type = 'shoppinglistitem' AND c['order'] ${filterExpression} ${order}`
    )
    .fetchAll();

  for (let i = 0; i < itemsToIncrement.length; i++) {
    await container.item(itemsToIncrement[0].id).patch({
      operations: [
        {
          op: "incr",
          path: "/order",
          value: incrementValue,
        },
      ],
    });
  }
}

async function deleteShoppingListItem(request: HttpRequest, context: Context) {
  const { ids } = request.body as { ids: Array<string> };
  console.log(ids);

  const container = await getContainer();

  const promises = ids.map((id) => container.item(id).delete());
  await Promise.all(promises);

  const { resources: itemsToReorder } = await container.items
    .query("SELECT * FROM c WHERE c.type = 'shoppinglistitem'")
    .fetchAll();

  for (let i = 0; i < itemsToReorder.length; i++) {
    await container.item(itemsToReorder[0].id).patch({
      operations: [
        {
          op: "set",
          path: "/order",
          value: i,
        },
      ],
    });
  }
}

async function incrementOrder(container: Container, order: number) {
  await updateOrder(container, order, ">=", 1);
}

async function decrementOrder(container: Container, order: number) {
  await updateOrder(container, order, "<=", -1);
}

function setSignalRMessageToShoppingListItemsChanged(context: Context) {
  console.log(context.req.headers["signalrconnectionid"]);
  context.bindings.signalRMessages = [
    {
      target: "shoppingListItemsChanged",
      arguments: [context.req.headers["signalrconnectionid"]],
    },
  ];
}

function getSortFunction(a: CosmosShoppingListItem, b: CosmosShoppingListItem) {
  const aOrder = a.order ?? 999999;
  const bOrder = b.order ?? 999999;

  if (aOrder < bOrder) {
    return -1;
  } else if (aOrder > bOrder) {
    return 1;
  } else {
    return 0;
  }
}

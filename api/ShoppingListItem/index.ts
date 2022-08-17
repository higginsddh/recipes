import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer } from "../dbService";
import { CosmosShoppingListItem } from "../cosmosModel/cosmosShoppingListItem";
import { Container } from "@azure/cosmos";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
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

  // if (originalShoppingListItem?.order !== body?.order) {
  if (typeof body?.order === "number") {
    console.log("increment");
    await incrementOrder(container, body.order, id);
  }

  if (
    typeof originalShoppingListItem?.order === "number" &&
    (typeof body?.order !== "number" ||
      originalShoppingListItem.order > body.order)
  ) {
    console.log("decrement");
    await decrementOrder(container, originalShoppingListItem.order, id);
  }
  // }
  console.log(`Update Id: ${id}, Value: ${body.order}`);

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
    await incrementOrder(container, body.order, "");
  }

  await container.items.create({
    ...body,
    type: "shoppinglistitem",
  });
}

async function deleteShoppingListItem(request: HttpRequest, context: Context) {
  const { ids } = request.body as { ids: Array<string> };

  const container = await getContainer();

  const promises = ids.map((id) => container.item(id).delete());
  await Promise.all(promises);

  const { resources: itemsToReorder } = await container.items
    .query(
      "SELECT * FROM c WHERE c.type = 'shoppinglistitem' ORDER by c['order']"
    )
    .fetchAll();

  for (let i = 0; i < itemsToReorder.length; i++) {
    await container.item(itemsToReorder[i].id).patch({
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

async function incrementOrder(
  container: Container,
  referenceOrder: number,
  itemUpdatingId: string
) {
  await updateOrder(container, referenceOrder, ">=", itemUpdatingId);
}

async function decrementOrder(
  container: Container,
  referenceOrder: number,
  itemUpdatingId: string
) {
  await updateOrder(container, referenceOrder, "<=", itemUpdatingId);
}

async function updateOrder(
  container: Container,
  referenceOrder: number,
  filterExpression: ">=" | "<=",
  itemUpdatingId: string
) {
  const { resources: itemsToIncrement } = await container.items
    .query({
      query: `SELECT * FROM c WHERE c.type = 'shoppinglistitem' AND c['id'] != @itemId AND c['order'] ${filterExpression} ${referenceOrder} ORDER by c['order']`,
      parameters: [
        {
          name: "@itemId",
          value: itemUpdatingId,
        },
      ],
    })
    .fetchAll();

  let baseValue = filterExpression === "<=" ? 0 : referenceOrder;
  for (let i = 0; i < itemsToIncrement.length; i++) {
    console.log(`Id: ${itemsToIncrement[i].id}, Value: ${baseValue + i}`);
    await container.item(itemsToIncrement[i].id).patch({
      operations: [
        {
          op: "set",
          path: "/order",
          value: baseValue + i,
        },
      ],
    });
  }
}

function setSignalRMessageToShoppingListItemsChanged(context: Context) {
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

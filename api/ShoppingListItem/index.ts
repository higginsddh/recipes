import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer } from "../dbService";
import { CosmosShoppingListItem } from "../cosmosModel/cosmosShoppingListItem";
import { Container } from "@azure/cosmos";
import { PageBlobUpdateSequenceNumberResponse } from "@azure/storage-blob";

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

  if (originalShoppingListItem?.order !== body?.order) {
    if (typeof body?.order === "number") {
      await reorderItems(container, id, body.order);
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

async function incrementOrder(container: Container, referenceOrder: number) {
  await updateOrder(container, referenceOrder, ">=", 1);
}

async function reorderItems(
  container: Container,
  itemUpdatingId: string | null,
  newOrder: number
) {
  const { resources: itemsToUpdate } = await container.items
    .query({
      query: `SELECT * FROM c WHERE c.type = 'shoppinglistitem' ORDER by c['order']`,
    })
    .fetchAll();

  let reorderedItems: Array<any>;
  if (itemUpdatingId !== null) {
    const oldOrder = itemsToUpdate.findIndex((i) => i.id === itemUpdatingId);
    reorderedItems = reorder(itemsToUpdate, oldOrder, newOrder);
  } else {
    reorderedItems = itemsToUpdate;
  }

  for (let i = 0; i < reorderedItems.length; i++) {
    await container.item(reorderedItems[i].id).patch({
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

async function updateOrder(
  container: Container,
  referenceOrder: number,
  filterExpression: ">=" | "<=",
  incrementValue: number
) {
  const { resources: itemsToIncrement } = await container.items
    .query({
      query: `SELECT * FROM c WHERE c.type = 'shoppinglistitem' AND c['order'] ${filterExpression} ${referenceOrder}`,
    })
    .fetchAll();

  for (let i = 0; i < itemsToIncrement.length; i++) {
    await container.item(itemsToIncrement[i].id).patch({
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

function setSignalRMessageToShoppingListItemsChanged(context: Context) {
  context.bindings.signalRMessages = [
    {
      target: "shoppingListItemsChanged",
      arguments: [context.req?.headers["signalrconnectionid"]],
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

function reorder<T>(list: Array<T>, startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer } from "../dbService";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  context.log("HTTP trigger function processed a request.");

  switch (req.method) {
    case "GET":
      await getTags(req, context);
      return;
    default:
      context.res = {
        status: 405,
      };
      return;
  }
};

export default httpTrigger;

async function getTags(request: HttpRequest, context: Context) {
  const container = await getContainer();

  const { resources: tags } = await container.items
    .query("SELECT * FROM c WHERE c.type = 'tag'")
    .fetchAll();

  const data = { tags };
  context.res = {
    body: data,
  };
}

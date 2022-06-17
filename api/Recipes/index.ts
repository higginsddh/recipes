import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer } from "../dbService";
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";
import { promisify } from "util";
import { FileSearchTerm } from "../cosmosModel/fileSearchTerm";
import { CosmosRecipe } from "../cosmosModel/cosmosRecipe";

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

  const id = request.params.id;
  if (id) {
    const recipe = await container.item(id).read();
    context.res = {
      body: recipe.resource,
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
  const id = request.params.id;
  const body = request.body as any;

  const fileSearchTerms = await readTextFromImages(body);

  const container = await getContainer();
  const { resource: originalRecipe } = await container.item(id).read();
  await container.item(id).replace({
    ...originalRecipe,
    ...body,
    fileSearchTerms,
  } as CosmosRecipe);
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

  const fileSearchTerms = await readTextFromImages(body);

  const container = await getContainer();
  await container.items.create({
    ...body,
    fileSearchTerms,
  });
}

async function readTextFromImages(body: any): Promise<Array<FileSearchTerm>> {
  if (!body.files) {
    console.warn("files not set");
    return [];
  }

  if (body.files.length === 0) {
    return [];
  }

  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({
      inHeader: {
        "Ocp-Apim-Subscription-Key": process.env.COMPUTER_VISION_KEY,
      },
    }),
    process.env.COMPUTER_VISION_URL
  );

  for (let i = 0; i < body.files.length; i++) {
    const result = await computerVisionClient.read(body.files[i].url);
    const operation = result.operationLocation.split("/").slice(-1)[0];

    let operationResult = await computerVisionClient.getReadResult(operation);
    let countCheck = 0;
    const sleep = promisify(setTimeout);
    while (operationResult.status !== "succeeded" && countCheck < 3) {
      await sleep(1000);

      operationResult = await computerVisionClient.getReadResult(operation);
      countCheck++;
    }

    if (operationResult.status === "succeeded") {
      return operationResult.analyzeResult.readResults.flatMap((r) =>
        r.lines.map(
          (l) =>
            ({
              fileId: body.files[i].id,
              text: l.text,
            } as FileSearchTerm)
        )
      );
    } else {
      console.log("unable to get response from ocr service");
      return [];
    }
  }
}

async function deleteRecipe(request: HttpRequest, context: Context) {
  const id = request.query["id"];

  const container = await getContainer();
  await container.item(id).delete();
}

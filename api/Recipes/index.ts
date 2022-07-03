import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { getContainer } from "../dbService";
import { ComputerVisionClient } from "@azure/cognitiveservices-computervision";
import { ApiKeyCredentials } from "@azure/ms-rest-js";
import { promisify } from "util";
import { FileSearchTerm } from "../cosmosModel/fileSearchTerm";
import { CosmosRecipe } from "../cosmosModel/cosmosRecipe";
import { Container } from "@azure/cosmos";

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
    const { resources } = await container.items
      .query("SELECT * FROM c WHERE c.type = 'recipe'")
      .fetchAll();

    const recipes = resources as Array<CosmosRecipe>;

    const data = { recipes };
    context.res = {
      body: data,
    };
  }
}

async function updateRecipe(request: HttpRequest, context: Context) {
  const id = request.params.id;
  const body = request.body as any;

  const container = await getContainer();
  const { resource: originalRecipe } = await container.item(id).read();

  const fileSearchTerms = await readTextFromImages(
    body as CosmosRecipe,
    originalRecipe as CosmosRecipe
  );

  await updateTags(container, body);

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

  await updateTags(container, body);

  await container.items.create({
    ...body,
    type: "recipe",
    fileSearchTerms,
  });
}

async function updateTags(
  container: Container,
  body: { tags?: Array<{ name: string }> }
) {
  if (!body.tags) {
    return;
  }

  const { resources: tags } = await container.items
    .query("SELECT * FROM c WHERE c.type = 'tag'")
    .fetchAll();

  const missingTags = body.tags
    .filter(
      (newTag) =>
        !tags.some(
          (oldTag) =>
            (newTag?.name ?? "").trim().toLowerCase() ===
            (oldTag?.name ?? "").trim().toLowerCase()
        )
    )
    .map((t) => t.name);

  for (let missingTag in missingTags) {
    await container.items.create({
      type: "tag",
      name: missingTags[missingTag],
    });
  }
}

async function readTextFromImages(
  newRecipe: CosmosRecipe,
  originalRecipe?: CosmosRecipe
): Promise<Array<FileSearchTerm>> {
  if (!newRecipe.files) {
    console.warn("files not set");
    return [];
  }

  if (newRecipe.files.length === 0) {
    return [];
  }

  const newFiles = newRecipe.files.filter(
    (newRecipeFile) =>
      !originalRecipe ||
      !originalRecipe.files.some(
        (originalRecipeFile) => originalRecipeFile.id === newRecipeFile.id
      )
  );

  const computerVisionClient = new ComputerVisionClient(
    new ApiKeyCredentials({
      inHeader: {
        "Ocp-Apim-Subscription-Key": process.env.COMPUTER_VISION_KEY,
      },
    }),
    process.env.COMPUTER_VISION_URL
  );

  console.log(`processing ${newFiles.length} file(s)`);

  for (let i = 0; i < newFiles.length; i++) {
    const result = await computerVisionClient.read(newFiles[i].url);
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
              fileId: newFiles[i].id,
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

import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import {
  BlobServiceClient,
  ContainerSASPermissions,
} from "@azure/storage-blob";

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  if (req.method === "GET") {
    const client = BlobServiceClient.fromConnectionString(
      process?.env?.STORAGE_CONNETION_STRING ?? ""
    );

    var date = new Date();
    var utcDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds()
    );

    const containerClient = client.getContainerClient("recipes");
    const url = await containerClient.generateSasUrl({
      expiresOn: new Date(utcDate.getTime() + 15 * 1000 * 60),
      permissions: ContainerSASPermissions.from({
        add: true,
        create: true,
        read: true,
        write: true,
      }),
    });

    context.res = {
      body: {
        connectionString: url,
      },
    };
  }
};

export default httpTrigger;

import { CosmosBase } from "./cosmosBase";

export type CosmosShoppingListItem = {
  name: string;
  quantity: number;
  purchased: boolean;
  order: number | undefined;
} & CosmosBase;

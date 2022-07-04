import { CosmosBase } from "./cosmosBase";
import { FileSearchTerm } from "./fileSearchTerm";

export type CosmosRecipe = {
  title: string;
  notes: string;
  ingredients?: Array<{ id: string; name: string }>;
  files?: Array<{ url: string; id: string }>;
  fileSearchTerms?: Array<FileSearchTerm>;
} & CosmosBase;

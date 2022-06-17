import { FileSearchTerm } from "./fileSearchTerm";

export type CosmosRecipe = {
  title: string;
  notes: string;
  files?: Array<{ url: string; id: string }>;
  fileSearchTerms?: Array<FileSearchTerm>;
};

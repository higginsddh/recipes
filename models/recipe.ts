import { UploadedFile } from "./uploadedFile";
import { FileSearchTerm } from "./fileSearchTerm";

export type Recipe = {
  id: string;
  title: string;
  notes: string;
  link?: string;
  files?: Array<UploadedFile>;
  tags?: Array<{ name: string }>;
  fileSearchTerms?: Array<FileSearchTerm>;
  ingredients?: Array<{ id: string; name: string }>;
};

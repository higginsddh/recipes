import { UploadedFile } from "./uploadedFile";

export type Recipe = {
  title: string;
  notes: string;
  link?: string;
  files?: Array<UploadedFile>;
};

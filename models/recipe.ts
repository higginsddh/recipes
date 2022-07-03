import { UploadedFile } from "./uploadedFile";

export type Recipe = {
  id: string;
  title: string;
  notes: string;
  link?: string;
  files?: Array<UploadedFile>;
  tags?: Array<{ name: string }>;
};

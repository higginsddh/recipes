import { z } from "zod";
import { UploadedFileDefinition } from "./uploadedFile";
import { FileSearchTermDefinition } from "./fileSearchTerm";

export const RecipeDefinition = z.object({
  id: z.string(),
  title: z.string(),
  notes: z.string(),
  link: z.string().optional(),
  files: z.array(UploadedFileDefinition).optional(),
  tags: z.array(z.object({ name: z.string() })).optional(),
  fileSearchTerms: z.array(FileSearchTermDefinition).optional(),
  ingredients: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional(),
});

export type Recipe = z.infer<typeof RecipeDefinition>;

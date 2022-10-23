import { z } from "zod";

export const FileSearchTermDefinition = z.object({
  fileId: z.string(),
  text: z.string(),
});

export type FileSearchTerm = z.infer<typeof FileSearchTermDefinition>;

import { z } from "zod";

export const UploadedFileDefinition = z.object({
  url: z.string(),
  id: z.string(),
});

export type UploadedFile = z.infer<typeof UploadedFileDefinition>;

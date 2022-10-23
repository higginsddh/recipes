import { z } from "zod";

const ErrorResponseDefinition = z.object({
  error: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseDefinition>;

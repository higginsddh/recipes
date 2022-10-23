import { z } from "zod";

const ShoppingListItemFileDefinition = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number(),
  purchased: z.boolean(),
  order: z.number().optional(),
});

export type ShoppingListItem = z.infer<typeof ShoppingListItemFileDefinition>;

export type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  purchased: boolean;
  order: number | undefined;
};

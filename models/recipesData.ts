import { Recipe } from "./recipe";

export type RecipesData = {
  recipes: Array<
    {
      id: string;
    } & Recipe
  >;
};

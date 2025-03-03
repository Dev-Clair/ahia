import cron from "node-cron";
import { ListingsCollectionCleanUp } from "./jobs/listingsCollectionCleanUp";
import { ProductsCollectionCleanUp } from "./jobs/productsCollectionCleanUp";

export const ListingsJob = cron.schedule(
  "0 23 28 * *",
  ListingsCollectionCleanUp,
  { runOnInit: false }
);

export const ProductsJob = cron.schedule(
  "0 */3 * * *",
  ProductsCollectionCleanUp,
  { runOnInit: false }
);

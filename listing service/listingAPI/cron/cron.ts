import cron from "node-cron";
import { ListingsCollectionCleanUp } from "./jobs/listingsCollectionCleanUp";
import { ProductsCollectionCleanUp } from "./jobs/productsCollectionCleanUp";

const ListingsJob = cron.schedule("* * * * *", ListingsCollectionCleanUp);

const ProductJob = cron.schedule("0 */3 * * *", ProductsCollectionCleanUp);

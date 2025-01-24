import {
  // ListingsJob,
  ProductsJob,
} from "./scheduler";

export const Cron = async () =>
  Promise.allSettled([
    // ListingsJob.start(),
    ProductsJob.start(),
  ]);

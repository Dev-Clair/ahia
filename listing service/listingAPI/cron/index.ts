import { ListingsJob, ProductsJob } from "./scheduler";

export const Cron = async () =>
  await Promise.allSettled([ListingsJob.start(), ProductsJob.start()]);

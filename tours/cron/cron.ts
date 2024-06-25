import Bree from "bree";
import path from "path";

const Cron = new Bree({
  jobs: [
    {
      name: "sendTourNotification",
      path: path.join(__dirname, "cron", "jobs", "sendTourNotification.ts"),
      interval: "6 hours",
    },
  ],
});

export default Cron;

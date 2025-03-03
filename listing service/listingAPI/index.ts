import InitializeSentry from "./sentry";
import {
  Boot,
  DatabaseEventsListener,
  GlobalProcessEventsListener,
} from "./bootstrap";
import Database from "./database";
import Server from "./server";
import { Cron } from "./cron";

(async () => {
  // Initialize Sentry
  InitializeSentry();

  // Global Process Events Listener
  GlobalProcessEventsListener();

  // Database Connection Events Listener
  DatabaseEventsListener();

  // Start Application
  await Boot(Server, Database);

  // Run Jobs
  await Cron();
})();

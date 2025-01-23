import InitializeSentry from "./sentry";
import {
  Boot,
  DatabaseEventsListener,
  GlobalProcessEventsListener,
} from "./bootstrap";
import Database from "./database";
import Server from "./server";
import { ListingsJob, ProductsJob } from "./cron";

// Initialize Sentry
InitializeSentry();

// Global Process Events Listener
GlobalProcessEventsListener();

// Database Connection Events Listener
DatabaseEventsListener();

// Start Application
Boot(Server, Database);

// Run Jobs
(() => new Promise((resolve, reject) => resolve(ListingsJob.start())))();

(() => new Promise((resolve, reject) => resolve(ProductsJob.start())))();

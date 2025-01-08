import InitializeSentry from "./sentry";
import {
  Boot,
  DatabaseEventsListener,
  GlobalProcessEventsListener,
} from "./bootstrap";
import Database from "./database";
import Server from "./server";

// Initialize Sentry
InitializeSentry();

// Global Process Events Listener
GlobalProcessEventsListener();

// Database Connection Events Listener
DatabaseEventsListener();

// Start Application
Boot(Server, Database);

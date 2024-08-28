import InitializeSentry from "./sentry";
import {
  Bootstrap,
  DatabaseEventsListener,
  GlobalProcessEventsHandler,
} from "./bootstrap";
import Server from "./server";

// Initialize Sentry
InitializeSentry();

// Global Process Events Handler
GlobalProcessEventsHandler();

// Database Connection Events Listener
DatabaseEventsListener();

// Bootstrap Application
Bootstrap(Server);

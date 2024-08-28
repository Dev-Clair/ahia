import InitializeSentry from "./sentry";
import {
  Bootstrap,
  DatabaseEventsListener,
  GlobalProcessEventsListener,
} from "./bootstrap";
import Server from "./server";

// Initialize Sentry
InitializeSentry();

// Global Process Events Listener
GlobalProcessEventsListener();

// Database Connection Events Listener
DatabaseEventsListener();

// Bootstrap Application
Bootstrap(Server);

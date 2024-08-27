import InitializeSentry from "./sentry";
import {
  Bootstrap,
  DatabaseEventsListener,
  GlobalProcessEventsHandler,
} from "./bootstrap";
import Config from "./config";
import Server from "./server";

// Initialize Sentry
InitializeSentry(Config.TOUR.SERVICE.SENTRY_DSN, Config.NODE_ENV);

// Global Process Events Handler
GlobalProcessEventsHandler();

// Database Connection Events Listener
DatabaseEventsListener();

// Bootstrap Application
Bootstrap(Server);

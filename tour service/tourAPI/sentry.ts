import * as Sentry from "@sentry/node";
import Config from "./config";

export default function InitializeSentry(
  sentry_dsn: string = Config.TOUR.SERVICE.SENTRY_DSN,
  environment: string = Config.NODE_ENV
): Sentry.NodeClient | undefined {
  return Sentry.init({
    dsn: sentry_dsn,
    tracesSampleRate: 1.0,
    environment: environment,
  });
}

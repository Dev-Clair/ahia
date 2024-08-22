import * as Sentry from "@sentry/node";

export default (sentry_dsn: string, environment: string) =>
  Sentry.init({
    dsn: sentry_dsn,
    tracesSampleRate: 1.0,
    environment: environment,
  });

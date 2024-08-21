import * as Sentry from "@sentry/node";

export default (sentry_dsn: string, environment: string) =>
  Sentry.init({
    dsn: sentry_dsn,
    tracesSampleRate: 1.0,
    environment: environment,
  });

process.on("uncaughtException", (error) => {
  Sentry.captureException(error);

  console.error("Uncaught Exception thrown:", error);

  process.exitCode = 1;
});

process.on("unhandledRejection", (reason, promise) => {
  Sentry.captureException(reason);

  console.error("Unhandled Rejection at:", promise, "reason:", reason);

  process.exitCode = 1;
});

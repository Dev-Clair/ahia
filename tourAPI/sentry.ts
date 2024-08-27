import * as Sentry from "@sentry/node";

export default function InitSentry(
  sentry_dsn: string,
  environment: string
): Sentry.NodeClient | undefined {
  return Sentry.init({
    dsn: sentry_dsn,
    tracesSampleRate: 1.0,
    environment: environment,
  });
}

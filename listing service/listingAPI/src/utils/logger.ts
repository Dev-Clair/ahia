import Config from "../../config";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import CloudWatchLogsTransport from "./cloudwatchTransport";

const { combine, timestamp, printf } = format;

const logFormat = printf(
  ({ level, message, timestamp }) => `${timestamp} | ${level}: ${message}`
);

const APP_LOG_DIR = Config.LOG.APP;

const CRON_LOG_DIR = Config.LOG.CRON;

const App = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    ...(Config.NODE_ENV !== "production"
      ? [new transports.Console()]
      : [
          // CloudWatchLogsTransport.Create(),
          new DailyRotateFile({
            filename: "application-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            dirname: APP_LOG_DIR,
            maxFiles: "14d",
            level: "info",
          }),
          new DailyRotateFile({
            filename: "errors-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            dirname: `${APP_LOG_DIR}/errors`,
            maxFiles: "30d",
            level: "error",
          }),
        ]),
  ],
  defaultMeta: { service: Config.LISTING.SERVICE.NAME },
});

const Cron = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    ...(Config.NODE_ENV !== "production"
      ? [new transports.Console()]
      : [
          new DailyRotateFile({
            filename: "cron-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            dirname: CRON_LOG_DIR,
            maxFiles: "7d",
            level: "info",
          }),
          new DailyRotateFile({
            filename: "cron-errors-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            dirname: `${CRON_LOG_DIR}/errors`,
            maxFiles: "14d",
            level: "error",
          }),
        ]),
  ],
  defaultMeta: { service: "Cron-Jobs" },
});

const Log = { App, Cron };

export default Log;

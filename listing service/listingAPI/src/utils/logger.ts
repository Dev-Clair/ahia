import { readFile, unlink } from "fs/promises";
import path from "path";
import { createLogger, format, transports } from "winston";
import Config from "../../config";
import DailyRotateFile from "winston-daily-rotate-file";
import Storage from "./storage";

// Log format
const { combine, timestamp, printf } = format;

const logFormat = printf(
  ({ level, message, timestamp }) => `${timestamp} | ${level}: ${message}`
);

// S3 instance
const Bucket = Config.AWS.S3_BUCKET;

const Configuration: Record<string, any> = {
  region: Config.AWS.REGION,
  credentials: {
    accessKeyId: Config.AWS.IAM.ACCESS_KEY_ID,
    secretAccessKey: Config.AWS.IAM.SECRET_ACCESS_KEY,
  },
};

const S3 = Storage.Create(Configuration, Bucket);

// Bucket path
const SERVICE_NAME = Config.SERVICE_NAME;

const LOG_PATH = `${Config.AWS.REGION}/${SERVICE_NAME}/logs`;

// Log directory
const APP_LOG_DIR = Config.LOG.APP;

const CRON_LOG_DIR = Config.LOG.CRON;

// Log transports
const APP_LOG_TRANSPORT =
  [
    new DailyRotateFile({
      filename: "app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      dirname: APP_LOG_DIR,
      maxFiles: "14d",
      level: "info",
      utc: true,
      zippedArchive: true,
      options: { flags: "w", encoding: "utf8" }
    }),
    new DailyRotateFile({
      filename: "app-errors-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      dirname: `${APP_LOG_DIR}/errors`,
      maxFiles: "30d",
      level: "error",
      utc: true,
      zippedArchive: true,
      options: { flags: "w", encoding: "utf8" }
    }),
  ]


const CRON_LOG_TRANSPORT =
  [
    new DailyRotateFile({
      filename: "cron-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      dirname: CRON_LOG_DIR,
      maxFiles: "7d",
      level: "info",
      utc: true,
      zippedArchive: true,
      options: { flags: "w", encoding: "utf8" }
    }),
    new DailyRotateFile({
      filename: "cron-errors-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      dirname: `${CRON_LOG_DIR}/errors`,
      maxFiles: "14d",
      level: "error",
      utc: true,
      zippedArchive: true,
      options: { flags: "w", encoding: "utf8" }
    }),
  ];

// Transport events
APP_LOG_TRANSPORT.forEach((log) => log.on("rotate", function (file) {
  (async () => {
    try {
      if (!file) throw new Error("No file provided for rotation event");

      const key = `${LOG_PATH}/${path.basename(file)}`;

      const fileBuffer = await readFile(file);

      await S3.Upload(key, fileBuffer);

      await unlink(file);
    } catch (error: any) {
      console.error(`Log file upload failed with error: ${error.message}`);
    }
  })();
}));

CRON_LOG_TRANSPORT.forEach((log) => log.on("rotate", function (file) {
  (async () => {
    try {
      if (!file) throw new Error("No file provided for rotation event");

      const key = `${LOG_PATH}/${path.basename(file)}`;

      const fileBuffer = await readFile(file);

      await S3.Upload(key, fileBuffer);

      await unlink(file);
    } catch (error: any) {
      console.error(`Log file upload failed with error: ${error.message}`);
    }
  })();
}));

// Logger
const App = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    ...Config.NODE_ENV !== "production" ? [new transports.Console()] : APP_LOG_TRANSPORT
  ],
  defaultMeta: { domain: "Application" },
});

const Cron = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
  transports: [
    ...Config.NODE_ENV !== "production" ? [new transports.Console()] : CRON_LOG_TRANSPORT
  ],
  defaultMeta: { domain: "Cron" },
});

const Log = { App, Cron };

export default Log;

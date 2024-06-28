import { createLogger, format, transports } from "winston";

const { combine, timestamp, label, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const Logger = createLogger({
  level: "info",
  format: combine(label({ label: "tour-service" }), timestamp(), logFormat),
  transports: [
    new transports.Console({
      format: combine(colorize(), logFormat),
    }),
  ],
  exceptionHandlers: [new transports.File({ filename: "logs/exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "logs/rejections.log" })],
});

if (process.env.NODE_ENV !== "production") {
  Logger.add(
    new transports.Console({
      format: combine(colorize(), logFormat),
    })
  );
}

export default Logger;

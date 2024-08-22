import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const Logger = createLogger({
  level: "info",
  format: combine(timestamp(), logFormat),
});

Logger.add(
  new transports.Console({
    format: combine(colorize(), logFormat),
  })
);

export default Logger;

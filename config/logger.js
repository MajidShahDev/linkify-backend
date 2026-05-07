import winston from "winston";
import "winston-daily-rotate-file";

//  LOG FORMAT
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

//  CONSOLE FORMAT
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp}] ${level}: ${
      typeof message === "object" ? JSON.stringify(message) : message
    }`;
  })
);

//  TRANSPORTS
// APP LOG FILE
const appFile = new winston.transports.DailyRotateFile({
  filename: "logs/app/app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "5m", // app logs grow moderately
  maxFiles: "14d",
  format: logFormat,
});

// ACCESS LOG FILE
const accessFile = new winston.transports.DailyRotateFile({
  filename: "logs/access/access-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "10m", // access logs grow fastest
  maxFiles: "14d",
  format: logFormat,
});

// ERROR LOG FILE
const errorFile = new winston.transports.DailyRotateFile({
  filename: "logs/error/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxFiles: "30d",
  format: logFormat,
});

// EXCEPTION FILE
const exceptionFile = new winston.transports.DailyRotateFile({
  filename: "logs/exception/exception-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "90d", // sync crash history
  format: logFormat,
});

// REJECTION FILE
const rejectionFile = new winston.transports.DailyRotateFile({
  filename: "logs/rejection/rejection-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "90d", // async crash history
  format: logFormat,
});

//  LOGGERS
//  APP LOGGER (system + business logs)
export const appLogger = winston.createLogger({
  level: "info",
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    appFile,
    errorFile,
  ],
  exceptionHandlers: [exceptionFile],
  rejectionHandlers: [rejectionFile],
});

// ACCESS LOGGER (HTTP ONLY)
export const accessLogger = winston.createLogger({
  level: "info",
  transports: [
    // new winston.transports.Console({ format: consoleFormat }),
    accessFile,
  ],
});

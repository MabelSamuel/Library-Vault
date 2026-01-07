import winston from "winston";
import "winston-daily-rotate-file";

const { combine, timestamp, printf, errors } = winston.format;

const logFormat = printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level.toUpperCase()}] ${message} ${stack ? "\n" + stack : ""}`;
});

const transport = new winston.transports.DailyRotateFile({
  filename: "logs/error-%DATE%.log", 
  datePattern: "YYYY-MM-DD",
  zippedArchive: true, 
  maxSize: "20m",      
  maxFiles: "14d",    
  level: "error",
});

const logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    timestamp(),
    errors({ stack: true }),
    logFormat
  ),
  transports: [transport, new winston.transports.Console()],
});

export default logger;

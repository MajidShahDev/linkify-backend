import Redis from "ioredis";
import { appLogger } from "./logger.js";

const redis = new Redis(process.env.REDIS_URL);

redis.on("ready", () => {
  appLogger.info({
    type: "redis",
    message: "Redis connection ready",
  });
});

redis.on("error", (err) => {
  appLogger.error({
    type: "redis-error",
    message: err.message,
    stack: err.stack,
  });
});

export default redis;
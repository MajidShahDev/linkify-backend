import Redis from "ioredis";
import { appLogger } from "./logger.js";

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
redis.on('ready', () => console.log('Redis: Ready'));
redis.on("error", (err) => {
  appLogger.error({
    type: "redis-error",
    message: err.message,
    stack: err.stack,
  });
});

export default redis;
import cron from "node-cron";
import redis from "../config/redis.js";
import URL from "../models/url.model.js";
import { appLogger } from "../config/logger.js";

// Flush Redis clicks -> MongoDB every 1 minute ---
cron.schedule("* * * * *", async () => {
  let cursor = "0";
  try {
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        "clicks:*",
        "COUNT",
        100
      );
      cursor = nextCursor;

      for (const key of keys) {
        const dbId = key.split(":")[1];
        const count = await redis.get(key);
        if (!count) continue;

        await URL.findByIdAndUpdate(dbId, {
          $inc: { clicks: parseInt(count) },
        });
        await redis.del(key);
      }
    } while (cursor !== "0");
  } catch (error) {
    appLogger.error({
      type: "cron-job-error",
      job: "flush-redis-clicks",
      message: error.message,
      stack: error.stack,
    });
  }
});

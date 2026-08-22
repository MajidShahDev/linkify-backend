import cron from "node-cron";
import redis from "../config/redis.js";
import URL from "../models/url.model.js";

// Flush Redis clicks -> MongoDB every 1 minute ---
cron.schedule("* * * * *", async () => {
//   console.log("[CRON] Flushing Redis clicks to DB...");
  let cursor = "0";
  try {
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", "clicks:*", "COUNT", 100);
      cursor = nextCursor;

      for (const key of keys) {
        const dbId = key.split(":")[1];
        const count = await redis.get(key);
        if (!count) continue;

        await URL.findByIdAndUpdate(dbId, {
          $inc: { clicks: parseInt(count) }
        });
        await redis.del(key);
      }
    } while (cursor!== "0");
  } catch (err) {
    // console.error("[CRON] Flush failed:", err.message);
  }
});
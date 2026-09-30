import cron from "node-cron";
import redis from "../config/redis.js";
import URL from "../models/url.model.js";
import { appLogger } from "../config/logger.js";
import { randomUUID } from "node:crypto";

async function flushVisitQueue(key) {
  const [, , dbId] = key.split(":");

  const events = await redis.lrange(key, 0, -1);

  if (!events.length) {
    await redis.del(key);
    return;
  }

  const visits = events.map((event) => JSON.parse(event));

  // Remove duplicate events within this Redis batch.
  const uniqueVisits = [
    ...new Map(visits.map((visit) => [visit.eventId, visit])).values(),
  ];

  const eventIds = uniqueVisits.map((visit) => visit.eventId);

  const url = await URL.findOne(
    {
      _id: dbId,
      "visitHistory.eventId": { $in: eventIds },
    },
    { "visitHistory.eventId": 1 }
  );

  const existingEventIds = new Set(
    url?.visitHistory.map((visit) => visit.eventId) || []
  );

  const newVisits = uniqueVisits.filter(
    (visit) => !existingEventIds.has(visit.eventId)
  );

  if (!newVisits.length) {
    await redis.del(key);
    return;
  }

  await URL.findByIdAndUpdate(dbId, {
    $inc: { clicks: newVisits.length },
    $push: {
      visitHistory: {
        $each: newVisits,
      },
    },
  });

  await redis.del(key);
}

cron.schedule("* * * * *", async () => {
  let cursor = "0";

  try {
    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        "visits:*",
        "COUNT",
        100
      );

      cursor = nextCursor;

      for (const key of keys) {
        const processingKey = `processing:${key}:${randomUUID()}`;

        try {
          await redis.rename(key, processingKey);
        } catch (error) {
          if (error.message.includes("no such key")) {
            continue;
          }

          throw error;
        }

        try {
          await flushVisitQueue(processingKey);
        } catch (error) {
          appLogger.error({
            type: "cron-job-error",
            job: "flush-redis-visits",
            key: processingKey,
            message: error.message,
            stack: error.stack,
          });
        }
      }
    } while (cursor !== "0");

    // Retry queues left behind by previous failed flushes.
    let processingCursor = "0";

    do {
      const [nextCursor, keys] = await redis.scan(
        processingCursor,
        "MATCH",
        "processing:visits:*",
        "COUNT",
        100
      );

      processingCursor = nextCursor;

      for (const key of keys) {
        try {
          await flushVisitQueue(key);
        } catch (error) {
          appLogger.error({
            type: "cron-job-error",
            job: "retry-redis-visits",
            key,
            message: error.message,
            stack: error.stack,
          });
        }
      }
    } while (processingCursor !== "0");
  } catch (error) {
    appLogger.error({
      type: "cron-job-error",
      job: "flush-redis-visits",
      message: error.message,
      stack: error.stack,
    });
  }
});

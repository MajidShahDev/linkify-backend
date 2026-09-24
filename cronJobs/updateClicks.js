import cron from "node-cron";
import URL from "../models/url.model.js";
import { appLogger } from "../config/logger.js";

// Every hour
cron.schedule("0 * * * *", async () => {
  try {
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const urls = await URL.find(
      { visitHistory: { $exists: true, $ne: [] } },
      "visitHistory"
    );

    for (const url of urls) {
      const visits = url.visitHistory;

      const clicks24h = visits.filter((v) => v.timestamp >= last24h).length;

      const clicks7d = visits.filter((v) => v.timestamp >= last7d).length;

      const clicks30d = visits.filter((v) => v.timestamp >= last30d).length;

      await URL.updateOne(
        { _id: url._id },
        { $set: { clicks24h, clicks7d, clicks30d } }
      );
    }
  } catch (error) {
    appLogger.error({
      type: "cron-job-error",
      job: "update-click-counters",
      message: error.message,
      stack: error.stack,
    });
  }
});

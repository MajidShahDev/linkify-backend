import cron from "node-cron";
import URL from "../models/url.model.js";

// Every hour
cron.schedule("0 * * * *", async () => {
  const now = new Date();
  const last24h = new Date(now - 24 * 60 * 60 * 1000);
  const last7d = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const last30d = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // ✅ Optimized query
  const urls = await URL.find({ visitHistory: { $exists: true, $ne: [] } }, "visitHistory");

  for (const url of urls) {
    const visits = url.visitHistory;

    const clicks24h = visits.filter(v => v.timestamp >= last24h).length;
    const clicks7d = visits.filter(v => v.timestamp >= last7d).length;
    const clicks30d = visits.filter(v => v.timestamp >= last30d).length;

    await URL.updateOne(
      { _id: url._id },
      { $set: { clicks24h, clicks7d, clicks30d } }
    );
  }

  console.log("Click counters updated for URLs with visits");
});


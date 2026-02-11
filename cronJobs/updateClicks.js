import cron from "node-cron";
import URL from "../models/url.model.js";

// Every hour
cron.schedule("0 * * * *", async () => {
    // console.log("Cron running at", new Date());
  const now = new Date();

  const urls = await URL.find({});

  for (const url of urls) {
    const visits = url.visitHistory;

    const clicks24h = visits.filter(v => now - v.timestamp <= 24*60*60*1000).length;
    const clicks7d = visits.filter(v => now - v.timestamp <= 7*24*60*60*1000).length;
    const clicks30d = visits.filter(v => now - v.timestamp <= 30*24*60*60*1000).length;

    await URL.updateOne(
      { _id: url._id },
      { $set: { clicks24h, clicks7d, clicks30d } }
    );
  }

  console.log("Click counters updated for all URLs");
});


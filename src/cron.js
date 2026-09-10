import { CronJob } from "cron";
import https from "https";

const job = new CronJob("*/14 * * * *", function () {
  if (!process.env.API_URL) return;

  const url = process.env.API_URL.endsWith("/api/health")
    ? process.env.API_URL
    : `${process.env.API_URL.replace(/\/+$/, "")}/api/health`;

  https
    .get(url, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        console.log("⏰ [Cron] Keep-alive ping sent successfully to:", url);
      } else {
        console.log("⚠️ [Cron] Keep-alive ping responded with status:", res.statusCode);
      }
    })
    .on("error", (e) => console.error("❌ [Cron] Error sending keep-alive ping:", e.message));
});

export default job;
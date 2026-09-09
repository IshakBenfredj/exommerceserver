import { CronJob } from "cron";
import https from "https";

const job = new CronJob("*/14 * * * *", function () {
  if (!process.env.API_URL) return;
  https
    .get(process.env.API_URL, (res) => {
      if (res.statusCode === 200 || res.statusCode === 100) {
        console.log("GET request sent successfully");
      } else {
        console.log("GET request failed", res.statusCode);
      }
    })
    .on("error", (e) => console.error("Error while sending request", e));
});

export default job;
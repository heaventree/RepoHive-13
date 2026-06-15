// Netlify scheduled function — runs every Sunday at midnight UTC.
// Refreshes GitHub stats for the 150 oldest-updated user repos so the
// library stays current without manual intervention.

import { schedule } from "@netlify/functions";
import { rescanOldestRepos } from "../../lib/rescan";

export const handler = schedule("0 0 * * 0", async () => {
  try {
    const result = await rescanOldestRepos(150);
    console.log("[rescan] Weekly run complete:", JSON.stringify(result));
    return { statusCode: 200 };
  } catch (err: any) {
    console.error("[rescan] Failed:", err.message);
    return { statusCode: 500 };
  }
});

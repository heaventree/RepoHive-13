// Netlify scheduled function — runs daily at 02:00 UTC.
// Drains the reclassification backlog so the library picks up changes to the
// classification engine without anyone clicking "Run" in the admin panel.
// Work is awaited and persisted batch by batch, so if the run is cut short the
// next schedule resumes where it left off.

import { schedule } from "@netlify/functions";
import { reclassifyDrain } from "../../lib/reclassify";

export const handler = schedule("0 2 * * *", async () => {
  try {
    const result = await reclassifyDrain();
    console.log("[reclassify] Daily run complete:", JSON.stringify(result));
    return { statusCode: 200 };
  } catch (err: any) {
    console.error("[reclassify] Failed:", err.message);
    return { statusCode: 500 };
  }
});

// Lists the distinct tenant ids present in the database, with a repo count for
// each. Use it to find your own tenant id (your Clerk "user_..." id) so you can
// pass it to the seed migration's --copy-to flag — no browser/Clerk dashboard
// needed.
//
// Usage (run where TURSO_DATABASE_URL is reachable):
//   npx tsx scripts/list-tenants.ts

import "dotenv/config";
import { all } from "../db";

async function main() {
  const rows = await all<{ tenant_id: string; repos: number }>(`
    SELECT tenant_id, COUNT(*) AS repos
    FROM repos GROUP BY tenant_id
    ORDER BY repos DESC
  `);

  // Tenants that exist but have no repos yet (e.g. a freshly signed-in account).
  // The subscriptions table may not exist on a bare DB — treat that as "none".
  let empty: { tenant_id: string }[] = [];
  try {
    empty = await all<{ tenant_id: string }>(`
      SELECT tenant_id FROM subscriptions
      WHERE tenant_id NOT IN (SELECT DISTINCT tenant_id FROM repos)
    `);
  } catch {}

  if (rows.length === 0 && empty.length === 0) {
    console.log("No tenants found yet. Sign in to the app once to create your account, then re-run this.");
    return;
  }

  console.log("Tenants with repos:");
  for (const r of rows) {
    const kind = r.tenant_id.startsWith("org_") ? "org" : r.tenant_id.startsWith("user_") ? "user" : "other";
    console.log(`  ${r.tenant_id}  (${kind}, ${r.repos} repos)`);
  }
  if (empty.length) {
    console.log("Tenants with a subscription but no repos yet:");
    for (const e of empty) console.log(`  ${e.tenant_id}`);
  }
  console.log("\nYour personal account id is the one starting with 'user_' (or 'org_' if you use a team).");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});

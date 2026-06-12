// libSQL client.
//
// Use the fetch-based `web` client unconditionally. The default `@libsql/client`
// (Node) pulls in a native sqlite binding that doesn't survive Netlify's
// esbuild bundle and crashes the function at runtime. The web client has zero
// native deps, works fine for libsql:// and http(s):// URLs (i.e. Turso), and
// runs identically in serverless and long-lived Node servers.

import { createClient } from "@libsql/client/web";
import type { Client, InValue } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL?.trim();
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

if (!url) {
  throw new Error(
    "TURSO_DATABASE_URL is not set. Set it to a libsql:// URL in .env (local) " +
      "or in your hosting provider's environment variables (production).",
  );
}

export const db: Client = createClient({ url, authToken });

console.log(`Database client initialized: Turso (web/fetch) → ${new URL(url).host}`);

// libSQL rejects `undefined` bound parameters — coerce to null.
function normalize(args: any[]): InValue[] {
  return args.map((a) => (a === undefined ? null : a)) as InValue[];
}

// libSQL rows are array-like with non-enumerable column names, which serialize
// as arrays via JSON. Convert to plain objects so callers (and res.json) get
// the same `{ column: value }` shape better-sqlite3 returned.
export async function all<T = any>(sql: string, args: any[] = []): Promise<T[]> {
  const r = await db.execute({ sql, args: normalize(args) });
  return r.rows.map((row) =>
    Object.fromEntries(r.columns.map((c, i) => [c, (row as any)[i]])),
  ) as T[];
}

export async function get<T = any>(sql: string, args: any[] = []): Promise<T | undefined> {
  return (await all<T>(sql, args))[0];
}

export async function run(sql: string, args: any[] = []) {
  const r = await db.execute({ sql, args: normalize(args) });
  return {
    lastInsertRowid: r.lastInsertRowid != null ? Number(r.lastInsertRowid) : undefined,
    rowsAffected: r.rowsAffected,
  };
}

// Runs a multi-statement SQL script (e.g. schema creation).
export async function execScript(sql: string): Promise<void> {
  await db.executeMultiple(sql);
}

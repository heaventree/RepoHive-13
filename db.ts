import { createClient, type Client, type InValue } from "@libsql/client";

// Use Turso/libSQL when configured, otherwise fall back to a local file so the
// app runs offline (and in sandboxes without egress to turso.io). The same
// async driver/code path is exercised either way.
const url = process.env.TURSO_DATABASE_URL?.trim() || "file:repohive.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

export const db: Client = createClient({ url, authToken });

console.log(`Database client initialized: ${url.startsWith("file:") ? url : "Turso (remote)"}`);

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

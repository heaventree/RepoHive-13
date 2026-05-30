import { createClient, type Client, type InValue } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL?.trim() || "file:repohive.db";
const authToken = process.env.TURSO_AUTH_TOKEN?.trim() || undefined;

export const db: Client = createClient({ url, authToken });

console.log(`Database: ${url.startsWith("file:") ? url : "Turso (remote)"}`);

function normalize(args: any[]): InValue[] {
  return args.map((a) => (a === undefined ? null : a)) as InValue[];
}

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

export async function execScript(sql: string): Promise<void> {
  await db.executeMultiple(sql);
}

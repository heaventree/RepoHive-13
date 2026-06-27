// Small storage abstraction for user-uploaded files (currently just OG
// images). On Netlify, files go into a Netlify Blobs store — no extra
// credentials needed, it auto-configures from the function's environment.
// In local dev (`tsx server.ts`, no Netlify environment), it falls back to
// the local filesystem so uploads still work without `netlify dev`.

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const LOCAL_DIR = path.join(process.cwd(), ".uploads", "og-images");
const isNetlify = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);

export interface StoredImage {
  buffer: Buffer;
  contentType: string;
}

async function getBlobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore("og-images");
}

export async function saveImage(buffer: Buffer, contentType: string): Promise<string> {
  const id = crypto.randomUUID();
  if (isNetlify) {
    const store = await getBlobStore();
    await store.set(id, buffer, { metadata: { contentType } });
  } else {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(path.join(LOCAL_DIR, id), buffer);
    await fs.writeFile(path.join(LOCAL_DIR, `${id}.meta`), contentType, "utf-8");
  }
  return id;
}

export async function getImage(id: string): Promise<StoredImage | null> {
  // Reject anything that isn't a bare UUID before it touches the filesystem.
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  if (isNetlify) {
    const store = await getBlobStore();
    const result = await store.getWithMetadata(id, { type: "arrayBuffer" });
    if (!result) return null;
    return {
      buffer: Buffer.from(result.data),
      contentType: (result.metadata?.contentType as string) || "image/png",
    };
  }
  try {
    const [buffer, contentType] = await Promise.all([
      fs.readFile(path.join(LOCAL_DIR, id)),
      fs.readFile(path.join(LOCAL_DIR, `${id}.meta`), "utf-8"),
    ]);
    return { buffer, contentType };
  } catch {
    return null;
  }
}

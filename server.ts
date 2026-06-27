// Local dev / single-host server. The API routes themselves live in api-app.ts
// (shared with the Netlify Function). This file adds the Vite dev middleware
// (or the production static dist/ serve) and binds the port.

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { createApiApp } from "./api-app";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = createApiApp();
  const PORT = parseInt(process.env.PORT || "24678", 10);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });

    // Intercept Vite's HMR client script — prevents a WebSocket crash on
    // proxies that don't support WS (Replit). With hmr:false, Vite still
    // injects /@vite/client; return a stub module implementing the HMR API as
    // no-ops so the app boots cleanly.
    app.use((req, res, next) => {
      if (req.path === "/@vite/client") {
        res.setHeader("Content-Type", "application/javascript");
        return res.send(`
export function createHotContext() {
  return { accept: () => {}, dispose: () => {}, prune: () => {}, decline: () => {},
           invalidate: () => {}, on: () => {}, off: () => {}, send: () => {}, data: {} };
}
export function injectQuery(url) { return url; }
export function updateStyle(id, content) {
  let el = document.getElementById('vite-style-' + id);
  if (!el) { el = document.createElement('style'); el.id = 'vite-style-' + id; document.head.appendChild(el); }
  el.textContent = content;
}
export function removeStyle(id) {
  const el = document.getElementById('vite-style-' + id);
  if (el) el.remove();
}
`);
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    // Serve hashed assets with long cache — filenames change on rebuild
    app.use("/assets", express.static(path.join(__dirname, "dist/assets"), {
      maxAge: "1y",
      immutable: true,
    }));
    // Never cache index.html — it references hashed asset filenames
    app.use(express.static(path.join(__dirname, "dist"), {
      setHeaders(res, filePath) {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
        }
      },
    }));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createApiApp } from "./api-app";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = createApiApp();
  const PORT = parseInt(process.env.PORT || "24678", 10);

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });

    // Stub out Vite's HMR client so Replit's proxy doesn't crash on WebSocket upgrade
    app.use((req, res, next) => {
      if (req.path === "/@vite/client") {
        res.setHeader("Content-Type", "application/javascript");
        return res.send(`
export function createHotContext() {
  return { accept:()=>{}, dispose:()=>{}, prune:()=>{}, decline:()=>{},
           invalidate:()=>{}, on:()=>{}, off:()=>{}, send:()=>{}, data:{} };
}
export function injectQuery(url) { return url; }
export function updateStyle(id, content) {
  let el = document.getElementById('vite-style-' + id);
  if (!el) { el = document.createElement('style'); el.id = 'vite-style-' + id; document.head.appendChild(el); }
  el.textContent = content;
}
export function removeStyle(id) { const el = document.getElementById('vite-style-' + id); if (el) el.remove(); }
`);
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    app.use("/assets", express.static(path.join(__dirname, "dist/assets"), { maxAge: "1y", immutable: true }));
    app.use(express.static(path.join(__dirname, "dist"), {
      setHeaders(res, filePath) {
        if (filePath.endsWith("index.html")) res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      },
    }));
    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, () => {
    console.log(`RepoHive running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);

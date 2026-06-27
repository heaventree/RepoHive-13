// Netlify Function that runs the full Express API. The /api/* redirect in
// netlify.toml routes every API request here, and serverless-http translates
// the Lambda event/context into Express req/res so all existing routes work
// without modification.

import serverless from "serverless-http";
import { createApiApp, injectSeoMeta } from "../../api-app";

const app = createApiApp();

// SPA fallback (see the `/*` redirect in netlify.toml): rather than Netlify
// serving the static dist/index.html directly, every page request now comes
// through here so we can inject per-page SEO meta tags server-side before
// the HTML reaches the client. We can't read dist/index.html off disk (it's
// not bundled into the function), so we fetch the untouched static copy —
// dist/__seo-base.html, written by the `postbuild` script — straight from
// the CDN, which serves it directly since it's a real file.
app.get("*", async (req, res) => {
  try {
    const baseHtml = await fetch(`https://${req.get("host")}/__seo-base.html`).then((r) => r.text());
    res.set("Content-Type", "text/html").send(await injectSeoMeta(baseHtml, req.path));
  } catch {
    res.redirect(302, "/__seo-base.html");
  }
});

export const handler = serverless(app);

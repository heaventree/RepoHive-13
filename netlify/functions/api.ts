// Netlify Function that runs the full Express API. The /api/* redirect in
// netlify.toml routes every API request here, and serverless-http translates
// the Lambda event/context into Express req/res so all existing routes work
// without modification.

import serverless from "serverless-http";
import { createApiApp } from "../../api-app";

const app = createApiApp();

export const handler = serverless(app);

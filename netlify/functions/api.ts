import serverless from "serverless-http";
import { createApiApp } from "../../api-app";

const app = createApiApp();

export const handler = serverless(app);

// Shared repo AI-analysis logic.
//
// Both the ingest path (api-app.ts → deepseekAnalyze) and the background
// reclassification sweep (lib/reclassify.ts) build their prompt here so the
// classification rules can never drift between the two call sites.

// Bump this whenever the prompt / classification schema changes. The reclassify
// sweep treats any stored analysis with an older (or missing) classifierVersion
// as needing a refresh, so the library converges on the latest rules.
export const CLASSIFIER_VERSION = 2;

export function buildAnalysisPrompt(
  id: string,
  description: string,
  language: string | null,
  topics: string[],
  readme: string | null,
): string {
  return `You are a software repository analyst. Analyze this GitHub repository and return a JSON object.

Repository: ${id}
Language: ${language || 'unknown'}
Topics: ${topics.join(', ') || 'none'}
Description: ${description || 'none'}
README (first 2000 chars): ${(readme || '').slice(0, 2000)}

Return ONLY valid JSON with this exact structure:
{
  "category": "one of: Frontend, Backend, AI/ML, DevOps, Database, Tooling, Mobile, Security, General",
  "tags": ["array", "of", "3-6", "relevant", "tech", "tags"],
  "summary": "2-3 sentence plain English summary of what this repo does and who it's for",
  "useCases": ["3-5 specific use case strings"],
  "integrationNotes": [
    { "platform": "e.g. Next.js", "match": "Perfect Match or Good Fit", "description": "one sentence" }
  ],
  "productClass": "one of: app-killer, saas-ready, none",
  "comparableApp": "Name of the well-known paid product this replaces, or null",
  "demoUrl": "URL of a live demo or hosted homepage if one is mentioned in the README/description, else null",
  "enterpriseTier": true or false
}

Classification rules — be strict. "productClass" describes ONLY standalone,
production-ready, self-hostable end-user applications (something a non-developer
could deploy and use as a running service with a UI). Decide as follows:
- "app-killer": it is a credible drop-in replacement for a SPECIFIC, well-known
  paid SaaS product. Set "comparableApp" to that product's name and set
  "enterpriseTier" to true. Examples: Coolify replaces Heroku/Vercel, Supabase
  replaces Firebase, Plausible replaces Google Analytics.
- "saas-ready": it is a standalone self-hostable SaaS-style application, but it
  does NOT cleanly replace one single named product (it may overlap several, or
  be a novel category). Set "comparableApp" to null and "enterpriseTier" to false.
- "none": EVERYTHING ELSE. This includes libraries, SDKs, frameworks, CLI tools,
  developer utilities, plugins/extensions/themes, bridges or connectors, API
  wrappers, model weights, inference-engine adapters/add-ons, datasets, demos,
  templates, and anything that is a building block rather than a runnable app.
  Set "comparableApp" to null and "enterpriseTier" to false.
When unsure between "saas-ready" and "none", choose "none". A repo that merely
talks to or augments another service (a bridge, add-on, or adapter) is "none".`;
}

export interface AnalyzeResult {
  parsed: any | null;
  inputTokens: number;
  outputTokens: number;
}

// Calls DeepSeek and returns the parsed analysis JSON (or null on failure),
// along with token counts so the caller can record usage if it wants to.
export async function analyzeRepo(
  id: string,
  description: string,
  language: string | null,
  topics: string[],
  readme: string | null,
): Promise<AnalyzeResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const prompt = buildAnalysisPrompt(id, description, language, topics, readme);
  const fallbackInput = Math.ceil(prompt.length / 4);
  if (!apiKey) return { parsed: null, inputTokens: fallbackInput, outputTokens: 0 };

  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });
  if (!res.ok) {
    throw new Error(`DeepSeek API error ${res.status}: ${res.statusText}`);
  }
  const data: any = await res.json();
  const inputTokens = data.usage?.prompt_tokens ?? fallbackInput;
  const outputTokens = data.usage?.completion_tokens ?? 0;
  const text = data.choices?.[0]?.message?.content || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  return { parsed, inputTokens, outputTokens };
}

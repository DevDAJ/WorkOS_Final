import { env } from "$env/dynamic/private";

const DEFAULT_MODEL = "google/gemma-4-26b-a4b-it:free";
const MAX_RETRIES = 3;
const BASE_DELAY = 1000;
const TIMEOUT = 8000;

function extractJSON(text: string): string | null {
  const trimmed = text.trim();
  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    /* next */
  }
  const fence = trimmed.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (fence)
    try {
      JSON.parse(fence[1]);
      return fence[1];
    } catch {
      /* next */
    }
  const arr = trimmed.match(/\[[\s\S]*?\]/);
  if (arr)
    try {
      JSON.parse(arr[0]);
      return arr[0];
    } catch {
      /* next */
    }
  const obj = trimmed.match(/\{[\s\S]*?\}/);
  if (obj)
    try {
      JSON.parse(obj[0]);
      return obj[0];
    } catch {
      /* next */
    }
  return null;
}

async function fetchWithTimeout(
  url: string,
  opts: RequestInit,
  ms: number,
): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function callAI(
  system: string,
  user: string,
): Promise<string | null> {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = env.OPENROUTER_MODEL || DEFAULT_MODEL;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(BASE_DELAY * Math.pow(2, attempt - 1));
    try {
      const res = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": env.PUBLIC_APP_URL || "http://localhost:5173",
            "X-Title": "LivingCV",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            temperature: 0.7,
            max_tokens: 1024,
          }),
        },
        TIMEOUT,
      );
      if (!res.ok) {
        if (res.status === 429) {
          console.warn("AI rate limited, retrying...");
          continue;
        }
        if (res.status >= 500) {
          console.warn(`AI server error ${res.status}, retrying...`);
          continue;
        }
        console.error(
          `AI API error ${res.status}: ${await res.text().catch(() => "")}`,
        );
        return null;
      }
      const body = await res.json();
      const content = body?.choices?.[0]?.message?.content;
      if (!content) {
        console.warn("AI returned empty response, retrying...");
        continue;
      }
      const json = extractJSON(content);
      if (json) return json;
      console.warn("AI returned non-JSON, retrying...");
    } catch (e) {
      console.error("AI request failed:", e);
      continue;
    }
  }
  return null;
}

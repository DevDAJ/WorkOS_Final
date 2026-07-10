import { callAI } from "./client";

const SYSTEM_PROMPT = `You are a career intelligence AI. Your job is to extract relevant keywords from job descriptions that may be intentionally vague or full of buzzwords.

Given a job title and description, extract all relevant:
- Technical skills (languages, frameworks, tools, platforms)
- Soft skills (leadership, communication, problem-solving, etc.)
- Domain knowledge (e-commerce, fintech, healthcare, etc.)
- Concepts & methodologies (agile, CI/CD, microservices, etc.)

Rules:
- Return ONLY a JSON array of strings, e.g. ["React", "TypeScript", "Leadership"]
- No markdown, no explanation, no extra text
- Infer implied skills from vague language: "fast-paced environment" = "Agile", "wear many hats" = "Versatility"
- Be generous in extraction - capture everything relevant
- Deduplicate (case-insensitive, prefer title case)
- Max 25 keywords`;

export async function extractJobKeywords(job: {
  title: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  niceToHave?: string[];
}): Promise<string[]> {
  const parts = [`Title: ${job.title}`, `Description: ${job.description}`];
  if (job.responsibilities?.length) {
    parts.push(`Responsibilities:\n${job.responsibilities.map((r) => `- ${r}`).join("\n")}`);
  }
  if (job.requirements?.length) {
    parts.push(`Requirements:\n${job.requirements.map((r) => `- ${r}`).join("\n")}`);
  }
  if (job.niceToHave?.length) {
    parts.push(`Nice to have:\n${job.niceToHave.map((n) => `- ${n}`).join("\n")}`);
  }

  const result = await callAI(SYSTEM_PROMPT, parts.join("\n\n"));
  if (!result) return [];

  try {
    const parsed = JSON.parse(result);
    if (Array.isArray(parsed)) {
      return [...new Set(parsed.map((s: unknown) => String(s).trim()).filter(Boolean))] as string[];
    }
  } catch {
    /* fall through */
  }
  return [];
}

// Sentirel — `categories` Edge Function (Supabase / Deno)
// Server-side proxy for the AI category generator. Replaces the in-browser BYOK call
// in generateCategoriesViaAI(): the user no longer needs an Anthropic key — this holds it.
//
// Deploy:  supabase functions deploy categories
// Secrets: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//          (SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY are auto-injected)
//
// Frontend call (replaces the fetch to api.anthropic.com):
//   const { data, error } = await supabase.functions.invoke("categories", { body: { profession } })

import { createClient } from "jsr:@supabase/supabase-js@2";

const MODEL = "claude-sonnet-4-6";
const DAILY_CAP = 20; // per-user generations/day — you pay for these now; tune as needed

// Identical to the system prompt in generateCategoriesViaAI() so output is unchanged.
const SYSTEM_PROMPT = `You generate personal-finance category line items tailored to a user's profession or business.

Return ONLY valid JSON in this exact shape (no prose, no markdown fences):
{
  "assets": [{"key": "camelCase", "label": "Human Label", "placeholder": "e.g. $X,XXX", "hint": "5-15 words of plain-English context"}],
  "liabilities": [...same shape...],
  "expenses": [...same shape...]
}

Rules:
- 5-7 asset items, 4-6 liability items, 8-12 expense items
- "key" must be unique camelCase across all three arrays
- "label" 2-5 words, plain English (not jargon)
- "placeholder" is a realistic dollar example for that profession
- "hint" explains what's typical, a rule of thumb, or why this line matters
- Categories must be SPECIFIC to this user's stated work, not generic
- Avoid items that apply to everyone (no "Checking Account" unless distinctive)`;

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*", // tighten to https://sentirel.io once live
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  // 1) Auth — must be a signed-in user (the JWT is forwarded by supabase.functions.invoke)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) return json(401, { error: "Please sign in to use AI categories." });
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user }, error: authErr } = await userClient.auth.getUser();
  if (authErr || !user) return json(401, { error: "Please sign in to use AI categories." });

  // 2) Rate limit — atomic per-user daily cap via service role (bypasses RLS on ai_usage)
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: allowed, error: quotaErr } = await admin.rpc("bump_ai_usage", { p_user: user.id, p_cap: DAILY_CAP });
  if (quotaErr) return json(500, { error: "Couldn't check your usage. Try again shortly." });
  if (allowed === false) return json(429, { error: `Daily limit reached (${DAILY_CAP}/day). Try again tomorrow or use a template.` });

  // 3) Validate input
  let profession = "";
  try { profession = String((await req.json())?.profession ?? "").trim(); } catch { /* falls through */ }
  if (profession.length < 3) return json(400, { error: "Add a sentence or two about your work first." });
  if (profession.length > 4000) profession = profession.slice(0, 4000);

  // 4) Call Anthropic with the server-held key (same request as the old BYOK path)
  let resp: Response;
  try {
    resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": Deno.env.get("ANTHROPIC_API_KEY")!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `My work: ${profession}\n\nGenerate categories specific to this profession.` }],
      }),
    });
  } catch {
    return json(502, { error: "Couldn't reach the AI service. Try again shortly." });
  }

  if (!resp.ok) {
    // Never leak upstream bodies/keys; map to friendly messages.
    const msg = resp.status === 429 ? "The AI service is busy. Wait a moment and try again."
      : resp.status === 400 ? "The request was rejected — try a shorter, clearer description."
      : resp.status >= 500 ? "The AI service is temporarily unavailable. Try again shortly."
      : "The request failed. Please try again.";
    return json(502, { error: msg });
  }

  // 5) Parse + validate the model output (same handling as the app)
  let text = "";
  try { text = (await resp.json())?.content?.[0]?.text ?? ""; } catch { /* empty */ }
  if (!text) return json(502, { error: "Empty response — try again or use a template instead." });
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();

  let parsed: unknown;
  try { parsed = JSON.parse(cleaned); } catch {
    return json(502, { error: "The AI returned an unexpected format. Try a more specific description." });
  }
  const p = parsed as Record<string, unknown>;
  if (!Array.isArray(p.assets) || !Array.isArray(p.liabilities) || !Array.isArray(p.expenses)) {
    return json(502, { error: "The AI returned an unexpected shape. Try again." });
  }

  // Same shape the app already consumes: { assets, liabilities, expenses }
  return json(200, { assets: p.assets, liabilities: p.liabilities, expenses: p.expenses });
});

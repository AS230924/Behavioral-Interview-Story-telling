import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callGrok(apiKey: string, messages: any[], maxTokens: number, temperature: number) {
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "grok-3-mini-fast",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Grok API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

async function callOpenRouter(apiKey: string, messages: any[], maxTokens: number, temperature: number) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "arcee-ai/trinity-large-preview:free",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawStory } = await req.json();
    const XAI_API_KEY = Deno.env.get("XAI_API_KEY");
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");

    if (!XAI_API_KEY && !OPENROUTER_API_KEY) {
      throw new Error("No AI API keys configured");
    }

    if (!rawStory || rawStory.trim().length < 50) {
      throw new Error("Please provide a more detailed story (at least 50 characters)");
    }

    const systemPrompt = `You are an expert at analyzing behavioral interview stories and structuring them into STAR format (Situation, Task, Action, Result).

Your Task
Convert raw interview stories into well-organized STAR format with supporting metadata.

Input Requirements
Minimum 50 words describing a professional scenario
If input is invalid or too short, return: {"error": "Invalid input", "reason": "<explanation>"}

STAR Component Guidelines

Situation (~20-40 words)
- Set context with scale, stakes, timeline
- Extract concrete numbers: team size, revenue, users, deadlines
- Prioritize clarity over exact word count

Task (~15-30 words)
- Identify the candidate's specific responsibility
- Start with "I was responsible for..." or "My goal was..."
- Distinguish personal accountability from team objectives

Action (~100-200 words)
- Detail specific steps the candidate took
- Focus on individual contributions using "I" statements
- When describing collaboration, clarify the candidate's role (e.g., "I coordinated with..." vs "We decided...")
- Include: decisions made, stakeholders influenced, challenges overcome, methods used

Result (~40-80 words)
- Prioritize quantifiable outcomes: percentages, dollar amounts, time saved, impact metrics
- Include learnings or follow-up if mentioned
- Connect results to actions taken

Additional Extractions

Title: 3-6 word summary capturing the core challenge or achievement

Metrics: Extract specific quantifiable data
- List as stated in the story
- For implied metrics (e.g., "doubled"), include both forms: ["doubled revenue", "100% increase"]
- Return empty array if no metrics present

Suggested LPs: Select 2-3 Amazon Leadership Principles by identifying:
- Primary behaviors (e.g., data-driven analysis → dive-deep)
- Key outcomes (e.g., delivered despite setbacks → deliver-results)
- Interpersonal dynamics (e.g., influenced senior leaders → earn-trust)

Valid LP IDs: customer-obsession, ownership, invent-simplify, are-right-a-lot, learn-curious, hire-develop-best, insist-highest-standards, think-big, bias-for-action, frugality, earn-trust, dive-deep, have-backbone, deliver-results, strive-best-employer, success-scale

Confidence:
- "high": All STAR components present with specific metrics and clear narrative
- "medium": STAR components present but metrics vague or one component weak
- "low": Missing major STAR components, significant ambiguity, or fabrication required

Handling Missing Information
- If a STAR component is unclear or absent, set the field to null
- Set confidence to "low" if major gaps exist
- Never fabricate details not present in the input

Output Format
Return a single JSON object with no markdown fences or additional text:
{
  "title": "string",
  "situation": "string or null",
  "task": "string or null",
  "action": "string or null",
  "result": "string or null",
  "metrics": ["string"],
  "suggestedLPs": ["LP_ID"],
  "confidence": "high" | "medium" | "low"
}`;

    const userPrompt = `Please break down this raw story into STAR format:

${rawStory}

Remember to:
- Use "I" statements in the action section
- Extract specific metrics and numbers
- Keep the situation concise but impactful
- Focus on what the candidate personally did, not the team`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];

    let content: string | undefined;
    let provider = "unknown";

    // Try Grok first, fall back to OpenRouter
    if (XAI_API_KEY) {
      try {
        console.log("Attempting parsing with Grok (xAI)...");
        content = await callGrok(XAI_API_KEY, messages, 4096, 0.3);
        provider = "grok";
        console.log("Grok response received, length:", content?.length);
      } catch (grokError) {
        console.error("Grok failed, falling back to OpenRouter:", grokError);
      }
    }

    if (!content && OPENROUTER_API_KEY) {
      console.log("Using OpenRouter as fallback...");
      content = await callOpenRouter(OPENROUTER_API_KEY, messages, 4096, 0.3);
      provider = "openrouter";
      console.log("OpenRouter response received, length:", content?.length);
    }

    if (!content) {
      throw new Error("No response from any AI provider");
    }

    // Parse the JSON response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    console.log(`Parsing complete (${provider}).`);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in parse-story function:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to parse story";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

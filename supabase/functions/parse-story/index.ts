import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rawStory } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    if (!rawStory || rawStory.trim().length < 50) {
      throw new Error("Please provide a more detailed story (at least 50 characters)");
    }

    const systemPrompt = `You are an expert at analyzing behavioral interview stories and breaking them down into the STAR format (Situation, Task, Action, Result).

Your job is to take a raw, unstructured story and extract the key components into a well-organized STAR format.

Guidelines:
1. **Situation** (20-40 words): Set the context - include scale, stakes, timeline. Extract numbers like team size, revenue, users.
2. **Task** (15-30 words): Identify the candidate's specific responsibility. Start with "I was responsible for..." or "My goal was..."
3. **Action** (100-200 words): Detail the specific steps taken. Focus on "I" statements, not "we". Include decisions made, stakeholders influenced, challenges overcome.
4. **Result** (40-80 words): Extract quantifiable outcomes - percentages, dollar amounts, time saved, users impacted. Include learnings if mentioned.

Also extract:
- **Title**: A concise 3-6 word title for the story
- **Metrics**: List of specific quantifiable metrics mentioned (e.g., "25% increase", "$2M revenue", "3 weeks faster")
- **Suggested LPs**: List 2-3 Amazon Leadership Principles this story best demonstrates

Return ONLY valid JSON in this exact format:
{
  "title": "string",
  "situation": "string",
  "task": "string", 
  "action": "string",
  "result": "string",
  "metrics": ["string"],
  "suggestedLPs": ["LP_ID"],
  "confidence": "high" | "medium" | "low"
}

Leadership Principle IDs to use:
- customer-obsession
- ownership
- invent-simplify
- are-right-a-lot
- learn-curious
- hire-develop-best
- insist-highest-standards
- think-big
- bias-for-action
- frugality
- earn-trust
- dive-deep
- have-backbone
- deliver-results
- strive-best-employer
- success-scale`;

    const userPrompt = `Please break down this raw story into STAR format:

${rawStory}

Remember to:
- Use "I" statements in the action section
- Extract specific metrics and numbers
- Keep the situation concise but impactful
- Focus on what the candidate personally did, not the team`;

    console.log("Parsing story with Gemini...");

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 2048,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("OpenRouter Response received, length:", content?.length);

    if (!content) {
      throw new Error("No response from OpenRouter");
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
      console.error("Failed to parse Gemini response:", content);
      throw new Error("Failed to parse AI response");
    }

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

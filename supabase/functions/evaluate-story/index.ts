import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { story, primaryLPs, secondaryLPs } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert Amazon behavioral interview coach. You specialize in evaluating STAR (Situation, Task, Action, Result) stories for Amazon Leadership Principle interviews.

Your job is to provide actionable, specific feedback to help candidates improve their interview stories. Focus on:
1. STAR structure quality
2. Personal ownership ("I" vs "we")
3. Quantified metrics and results
4. Leadership Principle alignment
5. Senior-level signals (cross-functional impact, strategic thinking, scale)

Always be constructive and specific. Provide concrete examples of how to improve.`;

    const userPrompt = `Evaluate this STAR story for an Amazon behavioral interview:

**Story Details:**
- Primary Leadership Principles: ${primaryLPs.join(", ")}
- Secondary Leadership Principles: ${secondaryLPs.join(", ")}

**Situation:** ${story.situation}

**Task:** ${story.task}

**Action:** ${story.action}

**Result:** ${story.result}

**Key Metrics:** ${story.metrics.filter((m: string) => m).join(", ") || "None provided"}

Please provide your evaluation in the following JSON format:
{
  "summary": "A 2-3 sentence overall assessment of the story",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["specific improvement 1", "specific improvement 2", "specific improvement 3"],
  "suggestedMetrics": ["suggested metric 1", "suggested metric 2"],
  "lpFeedback": ["feedback on LP alignment 1", "feedback on LP alignment 2"],
  "interviewTip": "One key tip for delivering this story in an interview"
}

Respond ONLY with the JSON object, no additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let evaluation;
    try {
      // Try to extract JSON from the response (handle cases where there might be markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      evaluation = {
        summary: "Unable to parse AI evaluation. Please try again.",
        strengths: [],
        improvements: [],
        suggestedMetrics: [],
        lpFeedback: [],
        interviewTip: "Ensure your story follows the STAR format clearly."
      };
    }

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in evaluate-story function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

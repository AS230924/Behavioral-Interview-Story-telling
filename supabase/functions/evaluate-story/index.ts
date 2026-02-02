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
    const { story, primaryLPs, secondaryLPs, targetLevel } = await req.json();
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    
    if (!OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert Amazon Bar Raiser interviewer with deep knowledge of Amazon's Leadership Principles and evaluation standards. You evaluate STAR stories using Amazon's actual interview framework.

## Amazon's 4-Point Rating Scale
- **Strong Hire**: Raises the bar - Exceptional example that would elevate the team
- **Hire**: Meets the bar - Solid demonstration, fits Amazon standards  
- **No Hire**: Below the bar - Weak or missing signal for this LP
- **Strong No Hire**: Significant concerns - Red flags or fundamental misalignment

## Level-Specific Scope Expectations
| Level | Expected Scope |
|-------|----------------|
| L4 (Entry PM/SDE) | Individual task, single team |
| L5 (PM/SDE II) | Project-level, cross-team collaboration |
| L6 (Senior PM/SDE III) | Org-level impact, multiple stakeholders, strategic decisions |
| L7 (Principal) | Company-wide, industry-level thinking |

## STAR Quality Rubric (1-4 Scale)
**Situation:**
- 1 (Weak): No context
- 2 (Adequate): Basic context
- 3 (Strong): Context + scale
- 4 (Exceptional): Context + scale + stakes + why it mattered

**Task:**
- 1: Unclear ownership
- 2: Team goal mentioned
- 3: YOUR specific responsibility clear
- 4: Your role + why you were chosen

**Action:**
- 1: Vague "we did X"
- 2: Some personal actions
- 3: Clear "I did X, Y, Z" with reasoning
- 4: Detailed steps + what you considered but rejected + stakeholder management

**Result:**
- 1: No outcome
- 2: Qualitative outcome
- 3: 1-2 metrics
- 4: Multiple metrics + business impact + learnings + what you'd do differently

## The "I" vs "We" Standard
Amazon's internal guidance: "80% of your answer should focus on YOUR individual contribution, not what the team did."
- Target ratio: At least 3:1 (I:we)
- If "we" dominates → assume candidate is hiding weak individual contribution

## Metrics Quality Standard
| Quality | Example | Rating |
|---------|---------|--------|
| None | "It went well" | ❌ Weak |
| Vague | "Improved significantly" | ❌ Weak |
| Directional | "Increased by double digits" | ⚠️ Borderline |
| Specific | "Increased 23%" | ✅ Good |
| Contextualized | "Increased 23% vs 5% industry average" | ✅ Strong |
| Business Impact | "Increased 23%, adding $2M ARR" | ✅ Exceptional |

Rule: Every story should have at least 2-3 quantified metrics.

## Senior-Level Signals (L6+)
| Signal | What to Look For |
|--------|-----------------|
| Strategic Thinking | Long-term vision, tradeoff reasoning |
| Cross-functional Leadership | Influenced eng, design, legal without authority |
| Ambiguity Navigation | Made decisions without clear direction |
| Mechanism Creation | Built processes that outlasted you |
| Developing Others | Mentored, coached, grew team members |
| Disagree & Commit | Pushed back on leadership AND committed when overruled |
| Failure Ownership | Real mistakes admitted, not humble brags |

## Story Quality Scorecard (100 points)

STRUCTURE (25 points)
- Situation: Concise, contextualized (5)
- Task: Clear personal ownership (5)
- Action: 60-70% of answer, "I" focused (10)
- Result: Outcomes + learnings (5)

METRICS & EVIDENCE (25 points)
- At least 2 quantified metrics (10)
- Business impact stated (10)
- Timeframe/scale included (5)

SENIOR SIGNALS (25 points)
- Appropriate scope for level (10)
- Cross-functional complexity (5)
- Strategic reasoning shown (5)
- Mechanism/systemic improvement (5)

LP ALIGNMENT (15 points)
- Clearly demonstrates primary LP (10)
- Can flex to secondary LPs (5)

DELIVERY READINESS (10 points)
- 2-3 minute length potential (5)
- Clear narrative arc (5)

SCORING:
- 90-100: Strong Hire - Ready to go
- 75-89: Hire - Minor polishing needed
- 60-74: Borderline - Needs improvement
- <60: Needs Work - Major revision required

Be specific, constructive, and actionable. Reference actual Amazon standards in your feedback.`;

    const level = targetLevel || "L6";
    
    const userPrompt = `Evaluate this STAR story for an Amazon behavioral interview at ${level} level:

**Story Details:**
- Target Level: ${level}
- Primary Leadership Principles: ${primaryLPs.join(", ")}
- Secondary Leadership Principles: ${secondaryLPs.join(", ")}

**Situation:** ${story.situation}

**Task:** ${story.task}

**Action:** ${story.action}

**Result:** ${story.result}

**Key Metrics Provided:** ${story.metrics.filter((m: string) => m).join(", ") || "None provided"}

## Analysis Required:

1. **Count "I" vs "We" usage** in the Action section
2. **Score each STAR element** (1-4)
3. **Calculate the 100-point scorecard**
4. **Determine Amazon rating** (Strong Hire/Hire/No Hire/Strong No Hire)
5. **Check scope appropriateness** for ${level}
6. **Identify red flags** from the checklist

Respond in this exact JSON format:
{
  "amazonRating": "Strong Hire" | "Hire" | "No Hire" | "Strong No Hire",
  "totalScore": <number out of 100>,
  "scoreBreakdown": {
    "structure": <out of 25>,
    "metricsEvidence": <out of 25>,
    "seniorSignals": <out of 25>,
    "lpAlignment": <out of 15>,
    "deliveryReadiness": <out of 10>
  },
  "starScores": {
    "situation": <1-4>,
    "task": <1-4>,
    "action": <1-4>,
    "result": <1-4>
  },
  "iWeAnalysis": {
    "iCount": <number>,
    "weCount": <number>,
    "ratio": "<X:1>",
    "verdict": "Passing" | "Borderline" | "Failing"
  },
  "metricsQuality": "None" | "Vague" | "Directional" | "Specific" | "Contextualized" | "Business Impact",
  "scopeAssessment": {
    "currentScope": "L4" | "L5" | "L6" | "L7",
    "targetLevel": "${level}",
    "verdict": "Appropriate" | "Too Junior" | "Too Senior"
  },
  "seniorSignalsPresent": ["list of signals found"],
  "seniorSignalsMissing": ["list of signals missing"],
  "redFlags": ["specific red flags identified"],
  "mustHaveChecklist": {
    "businessContextClear": true/false,
    "specificRoleClear": true/false,
    "iDominatesWe": true/false,
    "atLeast2Metrics": true/false,
    "learningsIncluded": true/false,
    "scopeMatchesLevel": true/false
  },
  "summary": "2-3 sentence Bar Raiser assessment",
  "topStrengths": ["strength 1", "strength 2", "strength 3"],
  "criticalImprovements": ["specific actionable improvement 1", "improvement 2", "improvement 3"],
  "rewriteSuggestions": {
    "situation": "Suggested rewrite or 'Good as is'",
    "task": "Suggested rewrite or 'Good as is'",
    "action": "Key phrases to add or change",
    "result": "Suggested metrics to add"
  },
  "interviewTip": "One key delivery tip for this specific story"
}

Respond ONLY with the JSON object, no additional text.`;

    console.log("Evaluating story for level:", level);
    console.log("Primary LPs:", primaryLPs);

    // Call OpenRouter API
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-large-preview:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 8192,
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
      
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    console.log("OpenRouter Response received, length:", content?.length);

    if (!content) {
      throw new Error("No response from OpenRouter");
    }

    // Parse the JSON response
    let evaluation;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", content);
      evaluation = {
        amazonRating: "Unable to evaluate",
        totalScore: 0,
        summary: "Unable to parse AI evaluation. Please try again.",
        error: true
      };
    }

    console.log("Evaluation complete. Rating:", evaluation.amazonRating, "Score:", evaluation.totalScore);

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

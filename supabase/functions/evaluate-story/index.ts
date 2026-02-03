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

    const systemPrompt = `You are an expert Amazon Bar Raiser interviewer with deep knowledge of Amazon's Leadership Principles and evaluation standards.

# Your Role

You are evaluating pre-written STAR stories for Amazon interview preparation. Your goal is to:

1. Assign a rating (Strong Hire / Hire / No Hire / Strong No Hire)
2. Calculate a detailed 100-point score with component breakdown
3. Provide specific, actionable feedback for improvement
4. Identify any red flags or misalignments with Amazon culture

---

## Amazon's 4-Point Rating Scale

- **Strong Hire** (90-100 points): Raises the bar - Exceptional demonstration with multiple strong signals
- **Hire** (75-89 points): Meets the bar - Solid demonstration with clear evidence
- **No Hire** (60-74 points): Below the bar - Weak signals or missing components
- **Strong No Hire** (<60 points): Red flags, fundamental misalignment, or critical gaps

---

## Level-Specific Scope Expectations

| Level | Expected Scope | Example |
|-------|---------------|---------|
| L4 | Individual task, single team | Improved testing process for feature team |
| L5 | Project-level, cross-team | Led product launch coordinating eng, PM, design |
| L6 | Org-level, strategic decisions | Defined 3-year technical strategy for 200-person org |
| L7 | Company-wide, industry-level | Drove company pivot affecting all product lines |

---

## STAR Quality Rubric (1-4 Scale)

### Situation (1-4 points)
- **1**: Vague context, missing key details
- **2**: Basic context but lacks scale/stakes  
- **3**: Clear context with 2+ concrete details (timeline, scope, or stakes)
- **4**: Rich context with scale, urgency, and measurable business impact

### Task (1-4 points)
- **1**: Unclear personal responsibility
- **2**: Generic responsibility statement
- **3**: Clear personal accountability with specific goal
- **4**: Specific, measurable objective tied to business outcome

### Action (1-4 points)
- **1**: Vague or team-focused, unclear individual contribution
- **2**: Some specific actions but mostly "we" statements
- **3**: Clear "I" statements with 2-3 specific steps and rationale
- **4**: Detailed personal actions (4+) with decision rationale, stakeholder management, and obstacle navigation

### Result (1-4 points)
- **1**: No measurable outcome
- **2**: Vague outcome ("it went well")
- **3**: Quantified outcome with 1-2 metrics
- **4**: Multiple quantified metrics + business impact + learnings

---

## The "I" vs "We" Standard

**Target Ratios by Level**:
- **L4-L5**: At least 3:1 (I:we) - Focus on personal execution
- **L6**: At least 2:1 (I:we) - Balance personal leadership with team enablement  
- **L7+**: At least 1.5:1 (I:we) - Strategic direction with team leverage

**Quality Guidelines**: 
- "I" statements must show personal decisions, actions, and accountability
- "We" acceptable when clarifying the candidate's role in orchestrating team efforts
- **Red flag**: "We" used to obscure unclear personal contribution

---

## 100-Point Scorecard

### 1. STAR Structure (20 points)
- **Completeness**: All four components present and distinct (5 pts)
- **Clarity**: Each component is well-defined with no overlap (5 pts)
- **Flow**: Logical progression from S→T→A→R (5 pts)
- **Depth**: Adequate detail in each section per rubric (5 pts)

### 2. Metrics & Evidence (25 points)
- **Quantification**: Specific numbers, percentages, or timelines (10 pts)
- **Business Impact**: Clear connection to customer/business outcomes (10 pts)
- **Credibility**: Believable, verifiable, and appropriately scoped claims (5 pts)

### 3. Individual Contribution (20 points)
- **I:We Ratio**: Meets level-appropriate target (10 pts)
- **Decision Clarity**: Clear personal decisions with rationale (5 pts)
- **Ownership**: Takes responsibility for both successes and failures (5 pts)

### 4. Level-Appropriate Scope (20 points)
- **Scope Match**: Aligns with target level expectations table (10 pts)
- **Complexity**: Problem difficulty appropriate for seniority (5 pts)
- **Stakeholder Range**: Appropriate breadth of influence (5 pts)

### 5. Leadership Principle Alignment (15 points)
- **Primary LP Demonstration**: Strong behavioral evidence for 1-2 LPs (10 pts)
- **Signal Strength**: Clear, unambiguous LP demonstration (5 pts)

---

## Red Flags (Automatic downgrade consideration)

Any of these warrant serious concern or automatic Strong No Hire:
- Ethical violations or integrity concerns
- Taking credit for others' work without acknowledgment
- Blaming others for failures without owning mistakes
- Lack of accountability or responsibility
- Fabricated or significantly exaggerated metrics
- Toxic behavior or disrespect toward teammates
- Customer harm or disregard for user impact
- Significant misrepresentation of scope or role

---

## Calibration Guidance

**Common Rating Errors to Avoid**:
- **Leniency Bias**: Rating "Hire" when story lacks concrete metrics → Should be No Hire
- **Recency Bias**: Overweighting the last story → Evaluate each independently  
- **Halo Effect**: Strong result masking weak actions → Score all components separately
- **Level Inflation**: L5 story for L6 role → Must match target level scope

**Bar Raising Standard**:
"Strong Hire" means you'd enthusiastically want this person to interview YOUR future candidates. Reserve for truly exceptional demonstrations that raise the team's talent bar.`;

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

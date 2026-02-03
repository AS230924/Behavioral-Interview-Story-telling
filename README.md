# Amazon-style Story Mapper

An AI-powered tool for Amazon behavioral interview preparation. Input your stories in STAR format and receive detailed feedback based on Amazon's actual Bar Raiser evaluation framework.

## Features

### 📝 Story Management
- Create and manage STAR-format stories (Situation, Task, Action, Result)
- Tag stories with primary and secondary Leadership Principles
- Track metrics and quantifiable achievements
- Match stories to common interview questions

### 🤖 AI-Powered Story Parsing
Paste raw, unstructured narratives and let AI automatically:
- Extract and structure into STAR format
- Identify relevant Leadership Principles
- Pull out key metrics and achievements
- Assess confidence level of the extraction

### 📊 Bar Raiser Evaluation
Get comprehensive feedback using Amazon's actual evaluation framework:

**Rating Scale**
- Strong Hire (90-100): Raises the bar
- Hire (75-89): Meets the bar
- No Hire (60-74): Below the bar
- Strong No Hire (<60): Red flags or gaps

**100-Point Scorecard**
- STAR Structure (20 pts)
- Metrics & Evidence (25 pts)
- Individual Contribution (20 pts)
- Level-Appropriate Scope (20 pts)
- LP Alignment (15 pts)

**Level-Specific Evaluation**
- L4: Individual task, single team scope
- L5: Project-level, cross-team collaboration
- L6: Org-level, strategic decisions
- L7: Company-wide, industry-level impact

### 🎯 Coverage Matrix
Visual dashboard showing:
- Which Leadership Principles are covered by your stories
- Story strength ratings at a glance
- Gaps in your interview preparation

### ❓ Question Bank
- Common Amazon behavioral interview questions
- Filter by category and Leadership Principle
- See which stories can answer each question

## Leadership Principles Covered

| ID | Leadership Principle |
|----|---------------------|
| CO | Customer Obsession |
| OWN | Ownership |
| INV | Invent and Simplify |
| ARL | Are Right, A Lot |
| LBC | Learn and Be Curious |
| HDB | Hire and Develop the Best |
| IHS | Insist on Highest Standards |
| TB | Think Big |
| BFA | Bias for Action |
| FRU | Frugality |
| ET | Earn Trust |
| DD | Dive Deep |
| BB | Have Backbone; Disagree and Commit |
| DR | Deliver Results |
| BE | Strive to be Earth's Best Employer |
| BR | Success and Scale Bring Broad Responsibility |

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Edge Functions)
- **AI**: OpenRouter API (LLM for parsing and evaluation)

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (Supabase credentials)
4. Run development server: `npm run dev`

## Usage

### Adding a Story

1. Navigate to the Stories tab
2. Click "Add New Story"
3. Either:
   - **Manual Entry**: Fill in each STAR component
   - **AI Parse**: Paste raw text and let AI structure it
4. Select primary and secondary Leadership Principles
5. Add key metrics
6. Save your story

### Evaluating a Story

1. Open any saved story
2. Select your target level (L4-L7)
3. Click "Get AI Evaluation"
4. Review:
   - Overall rating and score
   - STAR component scores (1-4 each)
   - I:We ratio analysis
   - Strengths and improvements
   - Rewrite suggestions

### Interview Prep Workflow

1. Add 8-12 stories covering different Leadership Principles
2. Check the Coverage Matrix for gaps
3. Use AI evaluation to strengthen weak stories
4. Review the Questions view to ensure coverage
5. Practice delivery using rewrite suggestions

## API Reference

### Parse Story Endpoint
```
POST /functions/v1/parse-story
Body: { "rawStory": "string" }
Returns: { title, situation, task, action, result, metrics, suggestedLPs, confidence }
```

### Evaluate Story Endpoint
```
POST /functions/v1/evaluate-story
Body: { story, primaryLPs, secondaryLPs, targetLevel }
Returns: { amazonRating, totalScore, scoreBreakdown, starScores, ... }
```

## Evaluation Criteria

### STAR Quality Rubric (1-4 Scale)

| Score | Situation | Task | Action | Result |
|-------|-----------|------|--------|--------|
| 1 | Vague context | Unclear responsibility | Vague/team-focused | No measurable outcome |
| 2 | Basic context | Generic statement | Some "I" statements | Vague outcome |
| 3 | Clear + 2 details | Clear accountability | 2-3 specific steps | 1-2 metrics |
| 4 | Rich + business impact | Measurable objective | 4+ detailed actions | Multiple metrics + learnings |

### I:We Ratio Targets

| Level | Target Ratio | Focus |
|-------|-------------|-------|
| L4-L5 | 3:1 | Personal execution |
| L6 | 2:1 | Leadership + team enablement |
| L7+ | 1.5:1 | Strategic direction + team leverage |

## License

MIT

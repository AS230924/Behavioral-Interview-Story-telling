import { Story, StoryEvaluationResult } from '@/types/story';
import { leadershipPrinciples } from '@/data/leadershipPrinciples';

// Helper functions
const wordCount = (text: string): number => text ? text.trim().split(/\s+/).length : 0;
const hasNumbers = (text: string): boolean => /\d+/.test(text);
const hasPercentage = (text: string): boolean => /%|\bpercent\b/i.test(text);
const hasDollarAmount = (text: string): boolean => /\$[\d,]+|\d+\s*(million|thousand|k|m|bn)/i.test(text);
const hasTimeframe = (text: string): boolean => /\d+\s*(day|week|month|quarter|year|sprint)/i.test(text);
const usesI = (text: string): boolean => /\bI\b/.test(text);

export const evaluateStory = (story: Story): StoryEvaluationResult => {
  const evaluation: StoryEvaluationResult = {
    overallScore: 0,
    overallRating: 'Needs Work',
    starScores: { situation: 0, task: 0, action: 0, result: 0 },
    strengths: [],
    improvements: [],
    warnings: [],
    seniorSignals: { present: [], missing: [] },
    metricQuality: 0,
    lpAlignment: { strong: [], weak: [] }
  };

  // Evaluate Situation
  const sitWords = wordCount(story.situation);
  if (sitWords >= 20 && sitWords <= 60) {
    evaluation.starScores.situation = 3;
    evaluation.strengths.push('Situation is appropriately concise');
  } else if (sitWords > 60) {
    evaluation.starScores.situation = 2;
    evaluation.improvements.push('Situation is too long - aim for 20-40 words');
  } else if (sitWords > 0) {
    evaluation.starScores.situation = 1;
    evaluation.improvements.push('Situation needs more context - add scale, stakes, or team size');
  }

  if (hasNumbers(story.situation)) {
    evaluation.starScores.situation += 1;
    evaluation.strengths.push('Situation includes scale/numbers');
  } else {
    evaluation.improvements.push('Add quantified context to Situation (team size, revenue, users)');
  }

  // Evaluate Task
  const taskWords = wordCount(story.task);
  if (taskWords >= 10 && taskWords <= 40) {
    evaluation.starScores.task = 3;
  } else if (taskWords > 0) {
    evaluation.starScores.task = 2;
    evaluation.improvements.push('Task should clearly state YOUR specific responsibility (10-30 words)');
  }

  if (usesI(story.task)) {
    evaluation.starScores.task += 1;
    evaluation.strengths.push('Task clearly shows personal ownership');
  } else {
    evaluation.improvements.push('Task should emphasize YOUR role - use "I" not "we"');
  }

  // Evaluate Action
  const actionWords = wordCount(story.action);
  const iCount = (story.action.match(/\bI\b/g) || []).length;
  const weCount = (story.action.match(/\bwe\b/gi) || []).length;

  if (actionWords >= 80) {
    evaluation.starScores.action = 3;
    evaluation.strengths.push('Action section has good depth');
  } else if (actionWords >= 40) {
    evaluation.starScores.action = 2;
    evaluation.improvements.push('Action section needs more detail - should be 60-70% of your answer');
  } else {
    evaluation.starScores.action = 1;
    evaluation.warnings.push('Action section is too short - expand with specific steps YOU took');
  }

  if (iCount > weCount) {
    evaluation.starScores.action += 1;
    evaluation.strengths.push('Good use of "I" - clear personal contribution');
  } else if (weCount > iCount) {
    evaluation.warnings.push(`"We" appears ${weCount}x vs "I" ${iCount}x - replace "we" with specific actions YOU took`);
  }

  // Check for specific action verbs
  const actionVerbs = /\b(built|created|led|designed|analyzed|presented|convinced|negotiated|prioritized|launched|shipped|identified|proposed|implemented)\b/gi;
  const actionVerbCount = (story.action.match(actionVerbs) || []).length;
  if (actionVerbCount >= 3) {
    evaluation.strengths.push('Strong action verbs demonstrate initiative');
  } else {
    evaluation.improvements.push('Use more specific action verbs: built, led, analyzed, convinced, launched');
  }

  // Evaluate Result
  const resultWords = wordCount(story.result);
  let resultScore = 0;

  if (resultWords >= 30) {
    resultScore += 2;
  } else if (resultWords > 0) {
    resultScore += 1;
    evaluation.improvements.push('Result section needs more detail on outcomes');
  }

  if (hasPercentage(story.result)) {
    resultScore += 1;
    evaluation.strengths.push('Result includes percentage metrics');
  }
  if (hasDollarAmount(story.result)) {
    resultScore += 1;
    evaluation.strengths.push('Result includes revenue/cost impact');
  }
  if (hasTimeframe(story.result)) {
    resultScore += 0.5;
  }

  evaluation.starScores.result = Math.min(4, resultScore);

  if (!hasNumbers(story.result)) {
    evaluation.warnings.push('Result has no metrics - add specific numbers (%, $, users, time saved)');
  }

  // Evaluate Metrics
  const metricsWithNumbers = story.metrics.filter(m => m && hasNumbers(m)).length;
  if (metricsWithNumbers >= 3) {
    evaluation.metricQuality = 3;
    evaluation.strengths.push('Strong quantified metrics');
  } else if (metricsWithNumbers >= 1) {
    evaluation.metricQuality = 2;
    evaluation.improvements.push('Add more specific metrics (aim for 3+)');
  } else {
    evaluation.metricQuality = 1;
    evaluation.warnings.push('No quantified metrics - this is critical for senior roles');
  }

  // Senior Level Signals
  const seniorKeywords: Record<string, RegExp> = {
    'cross-functional': /cross-functional|cross functional|multiple teams|stakeholder/i,
    'strategic': /strategic|strategy|long-term|roadmap|vision/i,
    'scale': /scale|million|thousands|org-wide|company-wide|global/i,
    'leadership': /led|managed|mentored|coached|developed|hired/i,
    'influence': /influenced|convinced|aligned|buy-in|stakeholder/i,
    'mechanism': /process|mechanism|framework|system|standard/i,
    'learning': /learned|realized|changed my approach|differently/i
  };

  Object.entries(seniorKeywords).forEach(([signal, regex]) => {
    const inAction = regex.test(story.action);
    const inResult = regex.test(story.result);
    if (inAction || inResult) {
      evaluation.seniorSignals.present.push(signal);
    } else {
      evaluation.seniorSignals.missing.push(signal);
    }
  });

  if (evaluation.seniorSignals.present.length >= 4) {
    evaluation.strengths.push('Strong senior-level signals present');
  } else if (evaluation.seniorSignals.present.length < 2) {
    evaluation.warnings.push('Add senior-level signals: cross-functional impact, strategic thinking, scale');
  }

  // LP Alignment Check
  const lpKeywords: Record<string, RegExp> = {
    'customer-obsession': /customer|user|client|feedback|experience/i,
    'ownership': /owned|responsible|accountability|end-to-end/i,
    'invent-simplify': /simplified|innovated|created|new approach|streamlined/i,
    'are-right': /wrong|incorrect|mistake|hypothesis|proved/i,
    'learn-curious': /learned|discovered|curious|explored|researched/i,
    'dive-deep': /analyzed|data|metrics|investigated|root cause/i,
    'earn-trust': /trust|relationship|transparent|honest|credibility/i,
    'backbone': /disagreed|pushed back|challenged|committed|despite/i,
    'deliver-results': /delivered|shipped|launched|achieved|completed/i,
    'frugality': /limited|constrained|efficient|resourceful|budget/i
  };

  story.primaryLPs.forEach(lpId => {
    const lp = leadershipPrinciples.find(l => l.id === lpId);
    if (lp) {
      const regex = lpKeywords[lpId];
      if (regex && (regex.test(story.action) || regex.test(story.result))) {
        evaluation.lpAlignment.strong.push(lp.name);
      } else if (regex) {
        evaluation.lpAlignment.weak.push(lp.name);
      }
    }
  });

  if (evaluation.lpAlignment.weak.length > 0) {
    evaluation.improvements.push(`Story doesn't clearly demonstrate: ${evaluation.lpAlignment.weak.join(', ')}. Add relevant keywords/actions.`);
  }

  // Calculate Overall Score
  const starTotal = Object.values(evaluation.starScores).reduce((a, b) => a + b, 0);
  const maxStar = 16;
  const seniorBonus = evaluation.seniorSignals.present.length * 0.5;
  const metricBonus = evaluation.metricQuality;
  const warningPenalty = evaluation.warnings.length * 0.5;

  evaluation.overallScore = Math.min(10, Math.max(1, 
    ((starTotal / maxStar) * 6) + seniorBonus + metricBonus - warningPenalty
  ));

  // Rating
  if (evaluation.overallScore >= 8) {
    evaluation.overallRating = 'Strong Hire';
  } else if (evaluation.overallScore >= 6) {
    evaluation.overallRating = 'Hire';
  } else if (evaluation.overallScore >= 4) {
    evaluation.overallRating = 'Borderline';
  } else {
    evaluation.overallRating = 'Needs Work';
  }

  return evaluation;
};

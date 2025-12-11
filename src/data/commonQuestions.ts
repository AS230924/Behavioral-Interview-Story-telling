export interface CommonQuestion {
  id: string;
  text: string;
  primaryLP: string;
  secondaryLPs: string[];
  category: string;
}

export const commonQuestions: CommonQuestion[] = [
  { id: 'q1', text: 'Tell me about a time you were wrong', primaryLP: 'are-right', secondaryLPs: ['earn-trust', 'learn-curious'], category: 'Failure & Learning' },
  { id: 'q2', text: 'Describe a time you went above and beyond for a customer', primaryLP: 'customer-obsession', secondaryLPs: ['ownership', 'deliver-results'], category: 'Customer Focus' },
  { id: 'q3', text: 'Tell me about a time you had to make a decision with incomplete information', primaryLP: 'bias-action', secondaryLPs: ['are-right', 'ownership'], category: 'Decision Making' },
  { id: 'q4', text: 'Describe a time you disagreed with your manager', primaryLP: 'backbone', secondaryLPs: ['earn-trust', 'are-right'], category: 'Conflict & Influence' },
  { id: 'q5', text: 'Tell me about your most innovative project', primaryLP: 'invent-simplify', secondaryLPs: ['think-big', 'customer-obsession'], category: 'Innovation' },
  { id: 'q6', text: 'Describe a time you failed to meet a deadline', primaryLP: 'deliver-results', secondaryLPs: ['ownership', 'earn-trust'], category: 'Failure & Learning' },
  { id: 'q7', text: 'Tell me about a time you had to influence without authority', primaryLP: 'earn-trust', secondaryLPs: ['ownership', 'backbone'], category: 'Conflict & Influence' },
  { id: 'q8', text: 'Describe a time you simplified a complex process', primaryLP: 'invent-simplify', secondaryLPs: ['customer-obsession', 'frugality'], category: 'Innovation' },
  { id: 'q9', text: 'Tell me about developing someone on your team', primaryLP: 'hire-develop', secondaryLPs: ['earn-trust', 'best-employer'], category: 'Leadership & Team' },
  { id: 'q10', text: 'Describe a time you had to deliver with limited resources', primaryLP: 'frugality', secondaryLPs: ['deliver-results', 'invent-simplify'], category: 'Execution' },
  { id: 'q11', text: 'Tell me about a time you raised the bar', primaryLP: 'highest-standards', secondaryLPs: ['customer-obsession', 'deliver-results'], category: 'Quality & Standards' },
  { id: 'q12', text: 'Describe your biggest career achievement', primaryLP: 'deliver-results', secondaryLPs: ['ownership', 'think-big'], category: 'Execution' },
  { id: 'q13', text: 'Tell me about a time you took ownership outside your role', primaryLP: 'ownership', secondaryLPs: ['customer-obsession', 'bias-action'], category: 'Ownership' },
  { id: 'q14', text: 'Describe a time you used data to make a decision', primaryLP: 'dive-deep', secondaryLPs: ['are-right', 'deliver-results'], category: 'Decision Making' },
  { id: 'q15', text: 'Tell me about adapting to a new environment or role', primaryLP: 'learn-curious', secondaryLPs: ['earn-trust', 'ownership'], category: 'Growth & Adaptability' },
  { id: 'q16', text: 'Describe a time you had to earn trust with a skeptical stakeholder', primaryLP: 'earn-trust', secondaryLPs: ['customer-obsession', 'backbone'], category: 'Conflict & Influence' },
  { id: 'q17', text: 'Tell me about a bold bet or risk you took', primaryLP: 'think-big', secondaryLPs: ['bias-action', 'ownership'], category: 'Innovation' },
  { id: 'q18', text: 'Describe handling conflicting priorities from stakeholders', primaryLP: 'backbone', secondaryLPs: ['customer-obsession', 'are-right'], category: 'Conflict & Influence' },
  { id: 'q19', text: 'Tell me about a time you learned something that changed your approach', primaryLP: 'learn-curious', secondaryLPs: ['are-right', 'invent-simplify'], category: 'Growth & Adaptability' },
  { id: 'q20', text: 'Describe building something from scratch', primaryLP: 'ownership', secondaryLPs: ['invent-simplify', 'deliver-results'], category: 'Execution' },
  { id: 'q21', text: 'Tell me about catching a critical detail others missed', primaryLP: 'dive-deep', secondaryLPs: ['highest-standards', 'ownership'], category: 'Quality & Standards' },
  { id: 'q22', text: 'Describe a time you committed to a decision you disagreed with', primaryLP: 'backbone', secondaryLPs: ['earn-trust', 'deliver-results'], category: 'Conflict & Influence' },
  { id: 'q23', text: 'Tell me about receiving tough feedback', primaryLP: 'earn-trust', secondaryLPs: ['learn-curious', 'highest-standards'], category: 'Failure & Learning' },
  { id: 'q24', text: 'Describe making your workplace more inclusive', primaryLP: 'best-employer', secondaryLPs: ['earn-trust', 'hire-develop'], category: 'Leadership & Team' },
  { id: 'q25', text: 'Tell me about considering broader impact of a decision', primaryLP: 'broad-responsibility', secondaryLPs: ['customer-obsession', 'think-big'], category: 'Leadership & Team' }
];

export const questionCategories = [
  'All',
  'Customer Focus',
  'Decision Making',
  'Conflict & Influence',
  'Innovation',
  'Failure & Learning',
  'Execution',
  'Leadership & Team',
  'Quality & Standards',
  'Growth & Adaptability',
  'Ownership'
];

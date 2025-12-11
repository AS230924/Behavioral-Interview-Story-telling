import { Story } from '@/types/story';

export const sampleStories: Story[] = [
  {
    id: 'story1',
    title: 'Checkout Hypothesis Proven Wrong',
    company: 'Previous Company',
    role: 'Senior PM',
    situation: 'Owned checkout flow processing $5M monthly. Conversion rate plateaued at 3.2%.',
    task: 'I hypothesized single-page checkout would reduce drop-off based on competitor analysis.',
    action: 'I built the business case and presented to leadership, got engineering buy-in for a 6-week sprint, and designed an A/B test with our data team. When we launched to 20% of traffic, conversion dropped 8%. Rather than defending my position, I dug into session recordings and discovered users were overwhelmed seeing payment, shipping, and confirmation simultaneously. I pivoted the team toward progressive disclosure - keeping steps but adding progress indicators. I also instituted a new practice: before any major UX change, we now run qualitative user testing alongside quantitative analysis.',
    result: 'Revised approach improved conversion by 12%, adding $600K annual revenue. The qualitative testing practice was adopted by 3 other product teams. I learned that reducing clicks doesn\'t always mean better UX - context matters.',
    metrics: ['12% conversion improvement', '$600K annual revenue increase', '8% initial drop detected', '3 teams adopted new practice'],
    primaryLPs: ['are-right', 'learn-curious', 'dive-deep'],
    secondaryLPs: ['customer-obsession', 'deliver-results', 'bias-action'],
    strength: 5,
    questionsMatched: ['q1', 'q14', 'q19']
  },
  {
    id: 'story2',
    title: 'Building Influence at Scale (Entain)',
    company: 'Entain',
    role: 'Senior PM',
    situation: 'Joined during COVID, 2000+ people across 15 countries. Owned regional product area with global dependencies.',
    task: 'Critical initiative deprioritized for 2 quarters. Needed platform team resources.',
    action: 'Mapped 4 key decision-makers, built 1:1 relationships before asking, reframed pitch from regional need to global template, created monthly stakeholder updates.',
    result: 'Initiative moved to #3 priority within one quarter. Shipped feature enabling market expansion. Update format adopted by other regional PMs.',
    metrics: ['2 quarters → 1 quarter prioritization', '#3 priority ranking', 'Format adopted org-wide'],
    primaryLPs: ['earn-trust', 'ownership', 'learn-curious'],
    secondaryLPs: ['backbone', 'deliver-results', 'invent-simplify'],
    strength: 4,
    questionsMatched: ['q7', 'q15', 'q16']
  }
];

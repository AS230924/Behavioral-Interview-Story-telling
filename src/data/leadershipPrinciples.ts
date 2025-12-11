export interface LeadershipPrinciple {
  id: string;
  name: string;
  short: string;
  description?: string;
}

export const leadershipPrinciples: LeadershipPrinciple[] = [
  { id: 'customer-obsession', name: 'Customer Obsession', short: 'CO' },
  { id: 'ownership', name: 'Ownership', short: 'OWN' },
  { id: 'invent-simplify', name: 'Invent and Simplify', short: 'INV' },
  { id: 'are-right', name: 'Are Right, A Lot', short: 'ARL' },
  { id: 'learn-curious', name: 'Learn and Be Curious', short: 'LBC' },
  { id: 'hire-develop', name: 'Hire and Develop the Best', short: 'HDB' },
  { id: 'highest-standards', name: 'Insist on Highest Standards', short: 'IHS' },
  { id: 'think-big', name: 'Think Big', short: 'TB' },
  { id: 'bias-action', name: 'Bias for Action', short: 'BFA' },
  { id: 'frugality', name: 'Frugality', short: 'FRU' },
  { id: 'earn-trust', name: 'Earn Trust', short: 'ET' },
  { id: 'dive-deep', name: 'Dive Deep', short: 'DD' },
  { id: 'backbone', name: 'Have Backbone; Disagree and Commit', short: 'BB' },
  { id: 'deliver-results', name: 'Deliver Results', short: 'DR' },
  { id: 'best-employer', name: "Strive to be Earth's Best Employer", short: 'BE' },
  { id: 'broad-responsibility', name: 'Success and Scale Bring Broad Responsibility', short: 'BR' }
];

export const getLP = (id: string): LeadershipPrinciple | undefined => 
  leadershipPrinciples.find(lp => lp.id === id);

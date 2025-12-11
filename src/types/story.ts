export interface Story {
  id: string;
  title: string;
  company: string;
  role: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  metrics: string[];
  primaryLPs: string[];
  secondaryLPs: string[];
  strength: number;
  questionsMatched: string[];
}

export interface StoryEvaluationResult {
  overallScore: number;
  overallRating: 'Strong Hire' | 'Hire' | 'Borderline' | 'Needs Work';
  starScores: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  strengths: string[];
  improvements: string[];
  warnings: string[];
  seniorSignals: {
    present: string[];
    missing: string[];
  };
  metricQuality: number;
  lpAlignment: {
    strong: string[];
    weak: string[];
  };
}

export interface AIEvaluation {
  summary: string;
  strengths: string[];
  improvements: string[];
  suggestedMetrics: string[];
  lpFeedback: string[];
  interviewTip: string;
}

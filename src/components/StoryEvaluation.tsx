import { useState } from 'react';
import { ChevronDown, ChevronRight, Zap, CheckCircle, X, TrendingUp, Lightbulb, ThumbsUp, AlertTriangle } from 'lucide-react';
import { Story, StoryEvaluationResult } from '@/types/story';
import { evaluateStory } from '@/utils/storyEvaluator';
import { cn } from '@/lib/utils';

interface StoryEvaluationProps {
  story: Story;
}

export const StoryEvaluation = ({ story }: StoryEvaluationProps) => {
  const evaluation = evaluateStory(story);
  const [expanded, setExpanded] = useState(true);

  const getRatingClass = (rating: string) => {
    switch (rating) {
      case 'Strong Hire': return 'rating-strong-hire';
      case 'Hire': return 'rating-hire';
      case 'Borderline': return 'rating-borderline';
      default: return 'rating-needs-work';
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.75) return 'bg-success';
    if (ratio >= 0.5) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-border">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Story Evaluation</h4>
          <span className={cn('rating-badge', getRatingClass(evaluation.overallRating))}>
            {evaluation.overallRating}
          </span>
          <span className="text-sm text-muted-foreground">
            Score: {evaluation.overallScore.toFixed(1)}/10
          </span>
        </div>
        {expanded ? <ChevronDown className="w-5 h-5 text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground" />}
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 animate-fade-in">
          {/* STAR Breakdown */}
          <div>
            <h5 className="text-sm font-medium text-muted-foreground mb-2">STAR Structure Score</h5>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(evaluation.starScores).map(([key, score]) => (
                <div key={key} className="bg-card rounded-lg p-2 border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium uppercase text-muted-foreground">{key}</span>
                    <span className="text-xs text-muted-foreground">{score}/4</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={cn('h-2 rounded-full transition-all', getScoreColor(score, 4))}
                      style={{ width: `${(score / 4) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {evaluation.strengths.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-success mb-2 flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" /> Strengths
              </h5>
              <ul className="space-y-1">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {evaluation.warnings.length > 0 && (
            <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/30">
              <h5 className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Critical Issues
              </h5>
              <ul className="space-y-1">
                {evaluation.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-destructive flex items-start gap-2">
                    <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {evaluation.improvements.length > 0 && (
            <div className="bg-warning/10 rounded-lg p-3 border border-warning/30">
              <h5 className="text-sm font-medium text-warning mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> How to Improve
              </h5>
              <ul className="space-y-1">
                {evaluation.improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Senior Level Signals */}
          <div>
            <h5 className="text-sm font-medium text-muted-foreground mb-2">Senior-Level Signals</h5>
            <div className="flex flex-wrap gap-2">
              {evaluation.seniorSignals.present.map(signal => (
                <span key={signal} className="px-2 py-1 bg-success/15 text-success rounded-md text-xs font-medium">
                  ✓ {signal}
                </span>
              ))}
              {evaluation.seniorSignals.missing.map(signal => (
                <span key={signal} className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                  ○ {signal}
                </span>
              ))}
            </div>
          </div>

          {/* LP Alignment */}
          {(evaluation.lpAlignment.strong.length > 0 || evaluation.lpAlignment.weak.length > 0) && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">LP Alignment</h5>
              <div className="flex flex-wrap gap-2">
                {evaluation.lpAlignment.strong.map(lp => (
                  <span key={lp} className="lp-badge lp-primary">
                    ✓ {lp}
                  </span>
                ))}
                {evaluation.lpAlignment.weak.map(lp => (
                  <span key={lp} className="px-2 py-1 bg-destructive/15 text-destructive rounded-md text-xs font-medium">
                    ⚠ {lp} - needs stronger signal
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

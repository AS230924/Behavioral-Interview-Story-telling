import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle, Lightbulb, Target, MessageSquare, AlertTriangle, X, TrendingUp, User, BarChart3 } from 'lucide-react';
import { Story } from '@/types/story';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AIStoryEvaluationProps {
  story: Story;
}

interface ComprehensiveEvaluation {
  amazonRating: string;
  totalScore: number;
  scoreBreakdown: {
    structure: number;
    metricsEvidence: number;
    seniorSignals: number;
    lpAlignment: number;
    deliveryReadiness: number;
  };
  starScores: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  iWeAnalysis: {
    iCount: number;
    weCount: number;
    ratio: string;
    verdict: string;
  };
  metricsQuality: string;
  scopeAssessment: {
    currentScope: string;
    targetLevel: string;
    verdict: string;
  };
  seniorSignalsPresent: string[];
  seniorSignalsMissing: string[];
  redFlags: string[];
  mustHaveChecklist: {
    businessContextClear: boolean;
    specificRoleClear: boolean;
    iDominatesWe: boolean;
    atLeast2Metrics: boolean;
    learningsIncluded: boolean;
    scopeMatchesLevel: boolean;
  };
  summary: string;
  topStrengths: string[];
  criticalImprovements: string[];
  rewriteSuggestions: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  interviewTip: string;
  error?: boolean;
}

const levelOptions = ['L4', 'L5', 'L6', 'L7'];

export const AIStoryEvaluation = ({ story }: AIStoryEvaluationProps) => {
  const [evaluation, setEvaluation] = useState<ComprehensiveEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [targetLevel, setTargetLevel] = useState('L6');
  const { toast } = useToast();

  const handleEvaluate = async () => {
    if (!story.situation && !story.action && !story.result) {
      toast({
        title: "Incomplete story",
        description: "Please add content to your story before evaluating",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-story', {
        body: {
          story: {
            situation: story.situation,
            task: story.task,
            action: story.action,
            result: story.result,
            metrics: story.metrics
          },
          primaryLPs: story.primaryLPs,
          secondaryLPs: story.secondaryLPs,
          targetLevel
        }
      });

      if (error) throw error;
      if (data.error && typeof data.error === 'string') throw new Error(data.error);

      setEvaluation(data);
      toast({
        title: "Bar Raiser Evaluation Complete",
        description: `Rating: ${data.amazonRating} (${data.totalScore}/100)`
      });
    } catch (error) {
      console.error('Evaluation error:', error);
      toast({
        title: "Evaluation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingClass = (rating: string) => {
    if (rating.includes('Strong Hire')) return 'bg-success text-success-foreground';
    if (rating === 'Hire') return 'bg-info text-info-foreground';
    if (rating === 'No Hire') return 'bg-warning text-warning-foreground';
    return 'bg-destructive text-destructive-foreground';
  };

  const getScoreClass = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 80) return 'bg-success';
    if (pct >= 60) return 'bg-info';
    if (pct >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getStarScoreLabel = (score: number) => {
    const labels = ['', 'Weak', 'Adequate', 'Strong', 'Exceptional'];
    return labels[score] || '';
  };

  return (
    <div className="bg-card rounded-xl p-4 border border-primary/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">Amazon Bar Raiser Evaluation</h4>
          <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary rounded-full">Gemini</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={targetLevel}
            onChange={(e) => setTargetLevel(e.target.value)}
            className="px-2 py-1 text-sm bg-secondary border border-border rounded-md"
          >
            {levelOptions.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          <Button
            onClick={handleEvaluate}
            disabled={isLoading}
            size="sm"
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Evaluate for {targetLevel}
              </>
            )}
          </Button>
        </div>
      </div>

      {evaluation && !evaluation.error && (
        <div className="space-y-4 animate-fade-in">
          {/* Amazon Rating & Score Header */}
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className={cn('px-4 py-2 rounded-lg font-bold text-lg', getRatingClass(evaluation.amazonRating))}>
              {evaluation.amazonRating}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-foreground">{evaluation.totalScore}</span>
                <span className="text-muted-foreground">/100</span>
              </div>
              <div className="w-full bg-muted rounded-full h-3">
                <div 
                  className={cn('h-3 rounded-full transition-all', getScoreClass(evaluation.totalScore, 100))}
                  style={{ width: `${evaluation.totalScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-sm text-foreground">{evaluation.summary}</p>
          </div>

          {/* Score Breakdown */}
          {evaluation.scoreBreakdown && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <BarChart3 className="w-4 h-4" /> Score Breakdown
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { label: 'Structure', value: evaluation.scoreBreakdown.structure, max: 25 },
                  { label: 'Metrics', value: evaluation.scoreBreakdown.metricsEvidence, max: 25 },
                  { label: 'Senior Signals', value: evaluation.scoreBreakdown.seniorSignals, max: 25 },
                  { label: 'LP Alignment', value: evaluation.scoreBreakdown.lpAlignment, max: 15 },
                  { label: 'Delivery', value: evaluation.scoreBreakdown.deliveryReadiness, max: 10 },
                ].map(item => (
                  <div key={item.label} className="bg-muted/20 rounded-lg p-2 text-center">
                    <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                    <div className="text-lg font-bold text-foreground">{item.value}<span className="text-xs text-muted-foreground">/{item.max}</span></div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                      <div 
                        className={cn('h-1.5 rounded-full', getScoreClass(item.value, item.max))}
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STAR Scores */}
          {evaluation.starScores && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">STAR Quality (1-4 Scale)</h5>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { letter: 'S', key: 'situation', cls: 'star-s' },
                  { letter: 'T', key: 'task', cls: 'star-t' },
                  { letter: 'A', key: 'action', cls: 'star-a' },
                  { letter: 'R', key: 'result', cls: 'star-r' },
                ].map(item => {
                  const score = evaluation.starScores[item.key as keyof typeof evaluation.starScores];
                  return (
                    <div key={item.key} className="bg-muted/20 rounded-lg p-2 text-center">
                      <span className={cn('star-badge mb-1', item.cls)}>{item.letter}</span>
                      <div className="text-lg font-bold text-foreground">{score}/4</div>
                      <div className="text-xs text-muted-foreground">{getStarScoreLabel(score)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* I vs We Analysis */}
          {evaluation.iWeAnalysis && (
            <div className={cn(
              'rounded-lg p-3 border',
              evaluation.iWeAnalysis.verdict === 'Passing' ? 'bg-success/10 border-success/30' :
              evaluation.iWeAnalysis.verdict === 'Borderline' ? 'bg-warning/10 border-warning/30' :
              'bg-destructive/10 border-destructive/30'
            )}>
              <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                <User className="w-4 h-4" /> "I" vs "We" Analysis
              </h5>
              <div className="flex items-center gap-4 text-sm">
                <span><strong>"I":</strong> {evaluation.iWeAnalysis.iCount}x</span>
                <span><strong>"We":</strong> {evaluation.iWeAnalysis.weCount}x</span>
                <span><strong>Ratio:</strong> {evaluation.iWeAnalysis.ratio}</span>
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  evaluation.iWeAnalysis.verdict === 'Passing' ? 'bg-success/20 text-success' :
                  evaluation.iWeAnalysis.verdict === 'Borderline' ? 'bg-warning/20 text-warning' :
                  'bg-destructive/20 text-destructive'
                )}>
                  {evaluation.iWeAnalysis.verdict}
                </span>
              </div>
              {evaluation.iWeAnalysis.verdict !== 'Passing' && (
                <p className="text-xs text-muted-foreground mt-2">Target: 3:1 ratio (I:We). 80% should focus on YOUR contribution.</p>
              )}
            </div>
          )}

          {/* Scope & Metrics Assessment */}
          <div className="grid grid-cols-2 gap-3">
            {evaluation.scopeAssessment && (
              <div className={cn(
                'rounded-lg p-3 border',
                evaluation.scopeAssessment.verdict === 'Appropriate' ? 'bg-success/10 border-success/30' : 'bg-warning/10 border-warning/30'
              )}>
                <h5 className="text-xs font-medium text-muted-foreground mb-1">Scope Assessment</h5>
                <div className="text-sm">
                  <span className="font-medium">{evaluation.scopeAssessment.currentScope}</span> scope for <span className="font-medium">{evaluation.scopeAssessment.targetLevel}</span> target
                </div>
                <span className={cn(
                  'text-xs',
                  evaluation.scopeAssessment.verdict === 'Appropriate' ? 'text-success' : 'text-warning'
                )}>
                  {evaluation.scopeAssessment.verdict}
                </span>
              </div>
            )}
            {evaluation.metricsQuality && (
              <div className="bg-muted/20 rounded-lg p-3 border border-border">
                <h5 className="text-xs font-medium text-muted-foreground mb-1">Metrics Quality</h5>
                <div className="text-sm font-medium">{evaluation.metricsQuality}</div>
                {evaluation.metricsQuality === 'None' || evaluation.metricsQuality === 'Vague' ? (
                  <span className="text-xs text-destructive">Needs quantified data</span>
                ) : evaluation.metricsQuality === 'Business Impact' ? (
                  <span className="text-xs text-success">Exceptional</span>
                ) : null}
              </div>
            )}
          </div>

          {/* Red Flags */}
          {evaluation.redFlags && evaluation.redFlags.length > 0 && (
            <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/30">
              <h5 className="text-sm font-medium text-destructive mb-2 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Red Flags
              </h5>
              <ul className="space-y-1">
                {evaluation.redFlags.map((flag, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Must-Have Checklist */}
          {evaluation.mustHaveChecklist && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Must-Have Checklist</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[
                  { key: 'businessContextClear', label: 'Business context clear' },
                  { key: 'specificRoleClear', label: 'Specific role clear' },
                  { key: 'iDominatesWe', label: '"I" dominates "We"' },
                  { key: 'atLeast2Metrics', label: '2+ metrics' },
                  { key: 'learningsIncluded', label: 'Learnings included' },
                  { key: 'scopeMatchesLevel', label: 'Scope matches level' },
                ].map(item => {
                  const passed = evaluation.mustHaveChecklist[item.key as keyof typeof evaluation.mustHaveChecklist];
                  return (
                    <div key={item.key} className={cn(
                      'flex items-center gap-2 text-xs px-2 py-1.5 rounded',
                      passed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    )}>
                      {passed ? <CheckCircle className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Senior Signals */}
          {(evaluation.seniorSignalsPresent?.length > 0 || evaluation.seniorSignalsMissing?.length > 0) && (
            <div>
              <h5 className="text-sm font-medium text-muted-foreground mb-2">Senior-Level Signals</h5>
              <div className="flex flex-wrap gap-2">
                {evaluation.seniorSignalsPresent?.map(signal => (
                  <span key={signal} className="px-2 py-1 bg-success/15 text-success rounded-md text-xs font-medium">
                    ✓ {signal}
                  </span>
                ))}
                {evaluation.seniorSignalsMissing?.map(signal => (
                  <span key={signal} className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                    ○ {signal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {evaluation.topStrengths && evaluation.topStrengths.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-success mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Top Strengths
              </h5>
              <ul className="space-y-1">
                {evaluation.topStrengths.map((s, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Improvements */}
          {evaluation.criticalImprovements && evaluation.criticalImprovements.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-warning mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Critical Improvements
              </h5>
              <ul className="space-y-1">
                {evaluation.criticalImprovements.map((imp, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Rewrite Suggestions */}
          {evaluation.rewriteSuggestions && (
            <div>
              <h5 className="text-sm font-medium text-info mb-2 flex items-center gap-1">
                <Target className="w-4 h-4" /> Rewrite Suggestions
              </h5>
              <div className="space-y-2">
                {[
                  { key: 'situation', label: 'Situation', cls: 'star-s' },
                  { key: 'task', label: 'Task', cls: 'star-t' },
                  { key: 'action', label: 'Action', cls: 'star-a' },
                  { key: 'result', label: 'Result', cls: 'star-r' },
                ].map(item => {
                  const suggestion = evaluation.rewriteSuggestions[item.key as keyof typeof evaluation.rewriteSuggestions];
                  if (!suggestion || suggestion === 'Good as is') return null;
                  return (
                    <div key={item.key} className="bg-secondary/50 rounded-lg p-2 text-sm">
                      <span className={cn('star-badge mr-2 text-xs', item.cls)}>{item.label[0]}</span>
                      <span className="text-foreground">{suggestion}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interview Tip */}
          {evaluation.interviewTip && (
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/30">
              <h5 className="text-sm font-medium text-primary mb-1 flex items-center gap-1">
                <MessageSquare className="w-4 h-4" /> Interview Delivery Tip
              </h5>
              <p className="text-sm text-foreground">{evaluation.interviewTip}</p>
            </div>
          )}
        </div>
      )}

      {!evaluation && !isLoading && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-2">
            Get a comprehensive Bar Raiser evaluation using Amazon's actual framework
          </p>
          <p className="text-xs text-muted-foreground">
            Includes 100-point scorecard, I/We analysis, scope assessment, and rewrite suggestions
          </p>
        </div>
      )}
    </div>
  );
};

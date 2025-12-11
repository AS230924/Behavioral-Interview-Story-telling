import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle, Lightbulb, Target, MessageSquare } from 'lucide-react';
import { Story, AIEvaluation } from '@/types/story';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AIStoryEvaluationProps {
  story: Story;
}

export const AIStoryEvaluation = ({ story }: AIStoryEvaluationProps) => {
  const [evaluation, setEvaluation] = useState<AIEvaluation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
          secondaryLPs: story.secondaryLPs
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setEvaluation(data);
      toast({
        title: "Evaluation complete",
        description: "AI has analyzed your story"
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

  return (
    <div className="bg-gradient-to-br from-primary/5 via-accent/5 to-secondary rounded-xl p-4 border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-foreground">AI-Powered Evaluation</h4>
          <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary rounded-full">Gemini</span>
        </div>
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
              Get AI Feedback
            </>
          )}
        </Button>
      </div>

      {evaluation && (
        <div className="space-y-4 animate-fade-in">
          {/* Summary */}
          <div className="bg-card rounded-lg p-3 border border-border">
            <p className="text-sm text-foreground">{evaluation.summary}</p>
          </div>

          {/* Strengths */}
          {evaluation.strengths.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-success mb-2 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Strengths Identified
              </h5>
              <ul className="space-y-1">
                {evaluation.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-success mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvements */}
          {evaluation.improvements.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-warning mb-2 flex items-center gap-1">
                <Lightbulb className="w-4 h-4" /> Suggested Improvements
              </h5>
              <ul className="space-y-1">
                {evaluation.improvements.map((imp, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-warning mt-1">•</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggested Metrics */}
          {evaluation.suggestedMetrics.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-info mb-2 flex items-center gap-1">
                <Target className="w-4 h-4" /> Suggested Metrics to Add
              </h5>
              <div className="flex flex-wrap gap-2">
                {evaluation.suggestedMetrics.map((m, i) => (
                  <span key={i} className="px-2 py-1 bg-info/15 text-info rounded-md text-xs">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* LP Feedback */}
          {evaluation.lpFeedback.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-lp-primary mb-2 flex items-center gap-1">
                <Target className="w-4 h-4" /> Leadership Principle Alignment
              </h5>
              <ul className="space-y-1">
                {evaluation.lpFeedback.map((fb, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-lp-primary mt-1">•</span>
                    {fb}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Interview Tip */}
          {evaluation.interviewTip && (
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/30">
              <h5 className="text-sm font-medium text-primary mb-1 flex items-center gap-1">
                <MessageSquare className="w-4 h-4" /> Interview Tip
              </h5>
              <p className="text-sm text-foreground">{evaluation.interviewTip}</p>
            </div>
          )}
        </div>
      )}

      {!evaluation && !isLoading && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Click "Get AI Feedback" to receive personalized suggestions from Gemini AI
        </p>
      )}
    </div>
  );
};

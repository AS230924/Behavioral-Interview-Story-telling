import { useState } from 'react';
import { Plus, Edit3, Trash2, Star, ChevronDown, ChevronRight, Zap, Sparkles } from 'lucide-react';
import { Story } from '@/types/story';
import { commonQuestions } from '@/data/commonQuestions';
import { getLP } from '@/data/leadershipPrinciples';
import { evaluateStory } from '@/utils/storyEvaluator';
import { StoryEvaluation } from './StoryEvaluation';
import { AIStoryEvaluation } from './AIStoryEvaluation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StoriesViewProps {
  stories: Story[];
  onAddStory: () => void;
  onEditStory: (story: Story) => void;
  onDeleteStory: (id: string) => void;
}

export const StoriesView = ({ stories, onAddStory, onEditStory, onDeleteStory }: StoriesViewProps) => {
  const [expandedEval, setExpandedEval] = useState<Record<string, boolean>>({});

  const getMatchedQuestions = (story: Story) => {
    return commonQuestions.filter(q => 
      story.primaryLPs.includes(q.primaryLP) || 
      story.secondaryLPs.some(lp => q.secondaryLPs.includes(lp)) ||
      story.questionsMatched?.includes(q.id)
    );
  };

  const getRatingClass = (rating: string) => {
    switch (rating) {
      case 'Strong Hire': return 'rating-strong-hire';
      case 'Hire': return 'rating-hire';
      case 'Borderline': return 'rating-borderline';
      default: return 'rating-needs-work';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Your Stories ({stories.length})</h2>
        <Button onClick={onAddStory} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Story
        </Button>
      </div>

      {stories.map(story => {
        const evaluation = evaluateStory(story);
        const matchedQuestions = getMatchedQuestions(story);
        const isExpanded = expandedEval[story.id];

        return (
          <div key={story.id} className="bg-card rounded-xl shadow-lg border border-border p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-foreground">{story.title}</h3>
                  <span className={cn('rating-badge', getRatingClass(evaluation.overallRating))}>
                    {evaluation.overallRating} ({evaluation.overallScore.toFixed(1)})
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{story.company} • {story.role}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star 
                      key={n} 
                      className={cn(
                        'w-4 h-4',
                        story.strength >= n ? 'text-primary fill-primary' : 'text-muted'
                      )} 
                    />
                  ))}
                </div>
                <Button variant="ghost" size="icon" onClick={() => onEditStory(story)}>
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onDeleteStory(story.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* STAR Summary */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { letter: 'S', label: 'Situation', content: story.situation, score: evaluation.starScores.situation, cls: 'star-s' },
                { letter: 'T', label: 'Task', content: story.task, score: evaluation.starScores.task, cls: 'star-t' },
                { letter: 'A', label: 'Action', content: story.action, score: evaluation.starScores.action, cls: 'star-a' },
                { letter: 'R', label: 'Result', content: story.result, score: evaluation.starScores.result, cls: 'star-r' }
              ].map(item => (
                <div key={item.letter} className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn('star-badge', item.cls)}>{item.letter}</span>
                      <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                    </div>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      item.score >= 3 ? 'bg-success/15 text-success' : 
                      item.score >= 2 ? 'bg-warning/15 text-warning' : 'bg-destructive/15 text-destructive'
                    )}>
                      {item.score}/4
                    </span>
                  </div>
                  <p className="text-xs text-foreground line-clamp-3">{item.content}</p>
                </div>
              ))}
            </div>

            {/* Metrics */}
            <div className="flex flex-wrap gap-2 mb-4">
              {story.metrics.filter(m => m).map((metric, idx) => (
                <span key={idx} className="px-2 py-1 bg-success/15 text-success rounded-md text-xs font-medium">
                  📊 {metric}
                </span>
              ))}
            </div>

            {/* LPs */}
            <div className="flex flex-wrap gap-1 mb-4">
              {story.primaryLPs.map(lpId => {
                const lp = getLP(lpId);
                return lp ? (
                  <span key={lpId} className="lp-badge lp-primary" title={lp.name}>
                    {lp.short}
                  </span>
                ) : null;
              })}
              {story.secondaryLPs.map(lpId => {
                const lp = getLP(lpId);
                return lp ? (
                  <span key={lpId} className="lp-badge lp-secondary" title={lp.name}>
                    {lp.short}
                  </span>
                ) : null;
              })}
            </div>

            {/* Evaluation Toggle */}
            <button
              onClick={() => setExpandedEval({ ...expandedEval, [story.id]: !isExpanded })}
              className="w-full text-left text-sm text-primary hover:text-primary/80 flex items-center gap-1 mb-2"
            >
              <Zap className="w-4 h-4" />
              {isExpanded ? 'Hide' : 'Show'} Detailed Evaluation & Improvement Tips
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {isExpanded && (
              <div className="space-y-4 mb-4">
                <StoryEvaluation story={story} />
                <AIStoryEvaluation story={story} />
              </div>
            )}

            {/* Matched Questions */}
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">✅ Can answer these questions:</p>
              <div className="flex flex-wrap gap-2">
                {matchedQuestions.slice(0, 6).map(q => (
                  <span key={q.id} className="px-2 py-1 bg-secondary text-foreground rounded-md text-xs">
                    {q.text.length > 40 ? q.text.substring(0, 40) + '...' : q.text}
                  </span>
                ))}
                {matchedQuestions.length > 6 && (
                  <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-xs">
                    +{matchedQuestions.length - 6} more
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {stories.length === 0 && (
        <div className="bg-card rounded-xl shadow-lg border border-border p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No stories yet</h3>
          <p className="text-muted-foreground mb-4">Add your first STAR story to get AI-powered evaluation</p>
          <Button onClick={onAddStory}>
            Add Your First Story
          </Button>
        </div>
      )}
    </div>
  );
};

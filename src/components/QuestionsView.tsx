import { useState } from 'react';
import { Filter, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import { Story } from '@/types/story';
import { commonQuestions, questionCategories } from '@/data/commonQuestions';
import { leadershipPrinciples, getLP } from '@/data/leadershipPrinciples';
import { evaluateStory } from '@/utils/storyEvaluator';
import { cn } from '@/lib/utils';

interface QuestionsViewProps {
  stories: Story[];
  onAddStory: () => void;
}

export const QuestionsView = ({ stories, onAddStory }: QuestionsViewProps) => {
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterLP, setFilterLP] = useState('all');

  const getStoriesForQuestion = (questionId: string) => {
    const question = commonQuestions.find(q => q.id === questionId);
    if (!question) return [];
    
    return stories.filter(story => 
      story.primaryLPs.includes(question.primaryLP) ||
      story.secondaryLPs.includes(question.primaryLP) ||
      question.secondaryLPs.some(lp => story.primaryLPs.includes(lp)) ||
      story.questionsMatched?.includes(questionId)
    ).sort((a, b) => {
      const aIsPrimary = a.primaryLPs.includes(question.primaryLP);
      const bIsPrimary = b.primaryLPs.includes(question.primaryLP);
      if (aIsPrimary && !bIsPrimary) return -1;
      if (!aIsPrimary && bIsPrimary) return 1;
      return b.strength - a.strength;
    });
  };

  const filteredQuestions = commonQuestions.filter(q => {
    if (filterCategory !== 'All' && q.category !== filterCategory) return false;
    if (filterLP !== 'all' && q.primaryLP !== filterLP && !q.secondaryLPs.includes(filterLP)) return false;
    return true;
  });

  const getRatingClass = (rating: string) => {
    switch (rating) {
      case 'Strong Hire': return 'bg-success/20 text-success';
      case 'Hire': return 'bg-info/20 text-info';
      default: return 'bg-warning/20 text-warning';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-card rounded-xl shadow-lg border border-border p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground"
          >
            {questionCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterLP}
            onChange={(e) => setFilterLP(e.target.value)}
            className="px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground"
          >
            <option value="all">All Leadership Principles</option>
            {leadershipPrinciples.map(lp => (
              <option key={lp.id} value={lp.id}>{lp.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions */}
      <div className="grid gap-3">
        {filteredQuestions.map(question => {
          const matchedStories = getStoriesForQuestion(question.id);
          const hasStory = matchedStories.length > 0;
          const primaryLP = getLP(question.primaryLP);

          return (
            <div 
              key={question.id} 
              className={cn(
                'bg-card rounded-xl shadow-lg border border-border p-4 border-l-4',
                hasStory ? 'border-l-success' : 'border-l-destructive'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {hasStory ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                    )}
                    <span className="text-xs px-2 py-0.5 bg-secondary text-muted-foreground rounded">
                      {question.category}
                    </span>
                  </div>
                  <p className="font-medium text-foreground">"{question.text}"</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">Primary LP:</span>
                    <span className="lp-badge lp-primary">{primaryLP?.name}</span>
                  </div>
                </div>
              </div>

              {hasStory ? (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Prepared stories:</p>
                  <div className="space-y-1">
                    {matchedStories.map(story => {
                      const evalResult = evaluateStory(story);
                      return (
                        <div key={story.id} className="flex items-center justify-between bg-success/10 rounded-md px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{story.title}</span>
                            <span className="text-xs text-muted-foreground">({story.company})</span>
                            <span className={cn('text-xs px-1.5 py-0.5 rounded', getRatingClass(evalResult.overallRating))}>
                              {evalResult.overallScore.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star 
                                key={n} 
                                className={cn(
                                  'w-3 h-3',
                                  story.strength >= n ? 'text-primary fill-primary' : 'text-muted'
                                )} 
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    No story prepared for this question
                  </p>
                  <button
                    onClick={onAddStory}
                    className="mt-2 text-xs text-primary hover:text-primary/80"
                  >
                    + Add a story for this question
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

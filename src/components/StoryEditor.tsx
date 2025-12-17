import { useState } from 'react';
import { X, Save, Wand2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Story } from '@/types/story';
import { leadershipPrinciples } from '@/data/leadershipPrinciples';
import { StoryEvaluation } from './StoryEvaluation';
import { AIStoryEvaluation } from './AIStoryEvaluation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StoryEditorProps {
  story: Story;
  isNew: boolean;
  onSave: (story: Story) => void;
  onClose: () => void;
}

export const StoryEditor = ({ story, isNew, onSave, onClose }: StoryEditorProps) => {
  const [rawStory, setRawStory] = useState('');
  const [showRawInput, setShowRawInput] = useState(isNew);
  const [isParsing, setIsParsing] = useState(false);

  const handleChange = (field: keyof Story, value: any) => {
    onSave({ ...story, [field]: value });
  };

  const parseRawStory = async () => {
    if (!rawStory.trim() || rawStory.trim().length < 50) {
      toast.error('Please enter a more detailed story (at least 50 characters)');
      return;
    }

    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-story', {
        body: { rawStory }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      // Update the story with parsed data
      onSave({
        ...story,
        title: data.title || story.title,
        situation: data.situation || '',
        task: data.task || '',
        action: data.action || '',
        result: data.result || '',
        metrics: data.metrics || [],
        primaryLPs: data.suggestedLPs?.slice(0, 2) || [],
        secondaryLPs: data.suggestedLPs?.slice(2, 4) || [],
      });

      setShowRawInput(false);
      setRawStory('');
      toast.success(`Story parsed successfully! (Confidence: ${data.confidence || 'medium'})`);
    } catch (error) {
      console.error('Failed to parse story:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to parse story');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleLP = (lpId: string, isPrimary: boolean) => {
    const field = isPrimary ? 'primaryLPs' : 'secondaryLPs';
    const otherField = isPrimary ? 'secondaryLPs' : 'primaryLPs';
    
    if (story[field].includes(lpId)) {
      handleChange(field, story[field].filter(id => id !== lpId));
    } else {
      handleChange(field, [...story[field], lpId]);
      handleChange(otherField, story[otherField].filter(id => id !== lpId));
    }
  };

  const wordCount = (text: string) => text ? text.trim().split(/\s+/).filter(w => w).length : 0;
  const iCount = (story.action.match(/\bI\b/g) || []).length;
  const weCount = (story.action.match(/\bwe\b/gi) || []).length;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl border border-border max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              {isNew ? 'Add New Story' : 'Edit Story'}
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* AI Story Parser */}
            <div className="border border-primary/30 rounded-lg bg-primary/5 overflow-hidden">
              <button
                onClick={() => setShowRawInput(!showRawInput)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground">AI Story Parser</span>
                  <span className="text-xs text-muted-foreground">(paste raw story, AI breaks it into STAR)</span>
                </div>
                {showRawInput ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              
              {showRawInput && (
                <div className="p-4 pt-0 space-y-3">
                  <Textarea
                    value={rawStory}
                    onChange={(e) => setRawStory(e.target.value)}
                    className="min-h-[150px] resize-none"
                    placeholder="Paste your raw, unstructured story here. For example:

'Last year at my company, we had a major issue with our checkout flow. Customers were abandoning carts at a 45% rate. I led a cross-functional team of 5 engineers and 2 designers to completely redesign the flow. I personally conducted 20+ user interviews, analyzed funnel data, and proposed a 3-step checkout instead of 6 steps. After 8 weeks, we reduced abandonment to 28% and increased revenue by $2.3M annually...'"
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {rawStory.length} characters • AI will extract Situation, Task, Action, Result
                    </p>
                    <Button
                      onClick={parseRawStory}
                      disabled={isParsing || rawStory.trim().length < 50}
                      className="gap-2"
                    >
                      {isParsing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Parsing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-4 h-4" />
                          Parse with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3">
                <label className="block text-sm font-medium text-muted-foreground mb-2">Story Title</label>
                <Input
                  value={story.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Checkout Redesign Pivot"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Company</label>
                <Input
                  value={story.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="e.g., Entain"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Role</label>
                <Input
                  value={story.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                  placeholder="e.g., Senior PM"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Story Strength (1-5)</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => handleChange('strength', n)}
                      className={cn(
                        'w-8 h-8 rounded-md transition-colors',
                        story.strength >= n ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STAR Format */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <span className="star-badge star-s mr-2">S</span>
                  Situation <span className="text-muted-foreground/60 font-normal">(20-40 words ideal)</span>
                </label>
                <Textarea
                  value={story.situation}
                  onChange={(e) => handleChange('situation', e.target.value)}
                  className="h-24 resize-none"
                  placeholder="Context, scale, stakes. Include numbers (team size, revenue, users)..."
                />
                <p className="text-xs text-muted-foreground mt-1">{wordCount(story.situation)} words</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <span className="star-badge star-t mr-2">T</span>
                  Task <span className="text-muted-foreground/60 font-normal">(YOUR responsibility)</span>
                </label>
                <Textarea
                  value={story.task}
                  onChange={(e) => handleChange('task', e.target.value)}
                  className="h-24 resize-none"
                  placeholder="Start with 'I...' - What was YOUR specific goal?"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <span className="star-badge star-a mr-2">A</span>
                  Action <span className="text-muted-foreground/60 font-normal">(60-70% of your answer - be specific!)</span>
                </label>
                <Textarea
                  value={story.action}
                  onChange={(e) => handleChange('action', e.target.value)}
                  className="h-36 resize-none"
                  placeholder="What YOU specifically did. Use 'I' not 'we'. Include: steps taken, stakeholders influenced, decisions made..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {wordCount(story.action)} words | "I": {iCount}x | "We": {weCount}x
                </p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  <span className="star-badge star-r mr-2">R</span>
                  Result <span className="text-muted-foreground/60 font-normal">(Metrics + Learnings)</span>
                </label>
                <Textarea
                  value={story.result}
                  onChange={(e) => handleChange('result', e.target.value)}
                  className="h-28 resize-none"
                  placeholder="Include: specific metrics (%, $, users), business impact, what you learned..."
                />
              </div>
            </div>

            {/* Metrics */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Key Metrics <span className="text-muted-foreground/60 font-normal">(aim for 3+)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {story.metrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Input
                      value={metric}
                      onChange={(e) => {
                        const newMetrics = [...story.metrics];
                        newMetrics[idx] = e.target.value;
                        handleChange('metrics', newMetrics);
                      }}
                      className="w-48 h-8 text-sm"
                      placeholder="e.g., 12% improvement"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleChange('metrics', story.metrics.filter((_, i) => i !== idx))}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary"
                  onClick={() => handleChange('metrics', [...story.metrics, ''])}
                >
                  + Add Metric
                </Button>
              </div>
            </div>

            {/* Leadership Principles */}
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-3">Leadership Principles</label>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Primary (story directly demonstrates)</p>
                  <div className="flex flex-wrap gap-1">
                    {leadershipPrinciples.map(lp => (
                      <button
                        key={lp.id}
                        onClick={() => toggleLP(lp.id, true)}
                        className={cn(
                          'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                          story.primaryLPs.includes(lp.id)
                            ? 'bg-lp-primary text-white'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                        title={lp.name}
                      >
                        {lp.short}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Secondary (story can be adapted for)</p>
                  <div className="flex flex-wrap gap-1">
                    {leadershipPrinciples.map(lp => (
                      <button
                        key={lp.id}
                        onClick={() => toggleLP(lp.id, false)}
                        disabled={story.primaryLPs.includes(lp.id)}
                        className={cn(
                          'px-2 py-1 rounded-md text-xs font-medium transition-colors',
                          story.secondaryLPs.includes(lp.id)
                            ? 'bg-lp-secondary text-white'
                            : story.primaryLPs.includes(lp.id)
                            ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                        title={lp.name}
                      >
                        {lp.short}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Evaluation Preview */}
            {(story.situation || story.action || story.result) && (
              <>
                <StoryEvaluation story={story} />
                <AIStoryEvaluation story={story} />
              </>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={onClose} className="gap-2">
                <Save className="w-4 h-4" />
                Save Story
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

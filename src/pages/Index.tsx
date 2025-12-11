import { useState } from 'react';
import { Target, BookOpen, HelpCircle, BarChart3 } from 'lucide-react';
import { Story } from '@/types/story';
import { sampleStories } from '@/data/sampleStories';
import { StoriesView } from '@/components/StoriesView';
import { QuestionsView } from '@/components/QuestionsView';
import { CoverageMatrix } from '@/components/CoverageMatrix';
import { LPCoverageSummary } from '@/components/LPCoverageSummary';
import { StoryEditor } from '@/components/StoryEditor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ViewMode = 'stories' | 'questions' | 'matrix';

const Index = () => {
  const [stories, setStories] = useState<Story[]>(sampleStories);
  const [viewMode, setViewMode] = useState<ViewMode>('stories');
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isNewStory, setIsNewStory] = useState(false);

  const createEmptyStory = (): Story => ({
    id: `story${Date.now()}`,
    title: '',
    company: '',
    role: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    metrics: [''],
    primaryLPs: [],
    secondaryLPs: [],
    strength: 3,
    questionsMatched: []
  });

  const handleAddStory = () => {
    setEditingStory(createEmptyStory());
    setIsNewStory(true);
  };

  const handleEditStory = (story: Story) => {
    setEditingStory({ ...story, metrics: [...story.metrics] });
    setIsNewStory(false);
  };

  const handleSaveStory = (updatedStory: Story) => {
    setEditingStory(updatedStory);
  };

  const handleCloseEditor = () => {
    if (editingStory && editingStory.title) {
      const existingIndex = stories.findIndex(s => s.id === editingStory.id);
      if (existingIndex >= 0) {
        const newStories = [...stories];
        newStories[existingIndex] = editingStory;
        setStories(newStories);
      } else {
        setStories([...stories, editingStory]);
      }
    }
    setEditingStory(null);
    setIsNewStory(false);
  };

  const handleDeleteStory = (id: string) => {
    setStories(stories.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <header className="bg-card rounded-xl shadow-lg border border-border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Target className="w-7 h-7 text-primary" />
                Story-Question Mapper
                <span className="ml-2 px-2 py-1 bg-primary/15 text-primary rounded-md text-xs font-medium">
                  + AI Evaluation
                </span>
              </h1>
              <p className="text-muted-foreground mt-1">
                Map and evaluate your STAR stories for Amazon interview success
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'stories' ? 'default' : 'secondary'}
                onClick={() => setViewMode('stories')}
                className="gap-2"
              >
                <BookOpen className="w-4 h-4" />
                Stories
              </Button>
              <Button
                variant={viewMode === 'questions' ? 'default' : 'secondary'}
                onClick={() => setViewMode('questions')}
                className="gap-2"
              >
                <HelpCircle className="w-4 h-4" />
                Questions
              </Button>
              <Button
                variant={viewMode === 'matrix' ? 'default' : 'secondary'}
                onClick={() => setViewMode('matrix')}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Coverage
              </Button>
            </div>
          </div>
        </header>

        {/* LP Coverage Summary */}
        <div className="mb-6">
          <LPCoverageSummary stories={stories} />
        </div>

        {/* Story Editor Modal */}
        {editingStory && (
          <StoryEditor
            story={editingStory}
            isNew={isNewStory}
            onSave={handleSaveStory}
            onClose={handleCloseEditor}
          />
        )}

        {/* Main Content */}
        {viewMode === 'stories' && (
          <StoriesView
            stories={stories}
            onAddStory={handleAddStory}
            onEditStory={handleEditStory}
            onDeleteStory={handleDeleteStory}
          />
        )}

        {viewMode === 'questions' && (
          <QuestionsView
            stories={stories}
            onAddStory={handleAddStory}
          />
        )}

        {viewMode === 'matrix' && (
          <CoverageMatrix stories={stories} />
        )}

        {/* Evaluation Legend */}
        <div className="mt-6 bg-card rounded-xl shadow-lg border border-border p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">📋 Evaluation Criteria</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
              <h4 className="font-semibold text-success">Strong Hire (8-10)</h4>
              <ul className="text-xs text-foreground/80 mt-2 space-y-1">
                <li>• Clear STAR structure</li>
                <li>• Strong "I" focus</li>
                <li>• 3+ quantified metrics</li>
                <li>• Senior-level signals</li>
                <li>• Strong LP alignment</li>
              </ul>
            </div>
            <div className="p-3 bg-info/10 border border-info/30 rounded-lg">
              <h4 className="font-semibold text-info">Hire (6-8)</h4>
              <ul className="text-xs text-foreground/80 mt-2 space-y-1">
                <li>• Good STAR structure</li>
                <li>• Mostly personal focus</li>
                <li>• 1-2 metrics</li>
                <li>• Some senior signals</li>
                <li>• LP keywords present</li>
              </ul>
            </div>
            <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
              <h4 className="font-semibold text-warning">Borderline (4-6)</h4>
              <ul className="text-xs text-foreground/80 mt-2 space-y-1">
                <li>• Incomplete STAR</li>
                <li>• Mix of "I" and "we"</li>
                <li>• Few/no metrics</li>
                <li>• Limited depth</li>
                <li>• Weak LP connection</li>
              </ul>
            </div>
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <h4 className="font-semibold text-destructive">Needs Work (1-4)</h4>
              <ul className="text-xs text-foreground/80 mt-2 space-y-1">
                <li>• Missing STAR elements</li>
                <li>• Team-focused not personal</li>
                <li>• No quantification</li>
                <li>• Vague actions</li>
                <li>• LP not evident</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

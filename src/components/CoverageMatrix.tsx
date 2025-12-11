import { Story } from '@/types/story';
import { leadershipPrinciples } from '@/data/leadershipPrinciples';
import { evaluateStory } from '@/utils/storyEvaluator';
import { cn } from '@/lib/utils';

interface CoverageMatrixProps {
  stories: Story[];
}

export const CoverageMatrix = ({ stories }: CoverageMatrixProps) => {
  const getCoverage = () => {
    const coverage: Record<string, { primary: number; secondary: number; total: number }> = {};
    leadershipPrinciples.forEach(lp => {
      coverage[lp.id] = {
        primary: stories.filter(s => s.primaryLPs.includes(lp.id)).length,
        secondary: stories.filter(s => s.secondaryLPs.includes(lp.id)).length,
        total: stories.filter(s => s.primaryLPs.includes(lp.id) || s.secondaryLPs.includes(lp.id)).length
      };
    });
    return coverage;
  };

  const coverage = getCoverage();

  const getRatingClass = (rating: string) => {
    switch (rating) {
      case 'Strong Hire': return 'bg-success/15 text-success';
      case 'Hire': return 'bg-info/15 text-info';
      case 'Borderline': return 'bg-warning/15 text-warning';
      default: return 'bg-destructive/15 text-destructive';
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6 overflow-x-auto">
      <h2 className="text-lg font-semibold text-foreground mb-4">Story × Leadership Principle Coverage Matrix</h2>
      
      <table className="w-full text-xs">
        <thead>
          <tr>
            <th className="text-left p-2 border-b border-border">Story</th>
            <th className="text-left p-2 border-b border-border">Rating</th>
            {leadershipPrinciples.map(lp => (
              <th key={lp.id} className="p-2 border-b border-border text-center" title={lp.name}>
                <span className="writing-mode-vertical text-muted-foreground">{lp.short}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stories.map(story => {
            const evalResult = evaluateStory(story);
            return (
              <tr key={story.id} className="hover:bg-secondary/50 transition-colors">
                <td className="p-2 border-b border-border font-medium text-foreground">{story.title}</td>
                <td className="p-2 border-b border-border">
                  <span className={cn('px-1.5 py-0.5 rounded text-xs', getRatingClass(evalResult.overallRating))}>
                    {evalResult.overallScore.toFixed(1)}
                  </span>
                </td>
                {leadershipPrinciples.map(lp => {
                  const isPrimary = story.primaryLPs.includes(lp.id);
                  const isSecondary = story.secondaryLPs.includes(lp.id);
                  return (
                    <td key={lp.id} className="p-2 border-b border-border text-center">
                      {isPrimary && <span className="coverage-dot coverage-primary inline-block" title="Primary"></span>}
                      {isSecondary && <span className="coverage-dot coverage-secondary inline-block" title="Secondary"></span>}
                      {!isPrimary && !isSecondary && <span className="coverage-dot coverage-none inline-block"></span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
          <tr className="bg-secondary/50 font-medium">
            <td className="p-2 border-t border-border text-foreground">Coverage</td>
            <td className="p-2 border-t border-border"></td>
            {leadershipPrinciples.map(lp => {
              const cov = coverage[lp.id];
              return (
                <td 
                  key={lp.id} 
                  className={cn(
                    'p-2 border-t border-border text-center',
                    cov.total === 0 ? 'text-destructive' : cov.total === 1 ? 'text-warning' : 'text-success'
                  )}
                >
                  {cov.total}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>

      <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="coverage-dot coverage-primary"></span> Primary LP</span>
        <span className="flex items-center gap-1.5"><span className="coverage-dot coverage-secondary"></span> Secondary LP</span>
        <span className="flex items-center gap-1.5"><span className="coverage-dot coverage-none"></span> Not covered</span>
      </div>

      {/* Gap Analysis */}
      <div className="mt-6 pt-6 border-t border-border">
        <h3 className="text-sm font-semibold text-foreground mb-3">⚠️ Coverage Gaps</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {leadershipPrinciples.filter(lp => coverage[lp.id].total === 0).map(lp => (
            <div key={lp.id} className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="font-medium text-destructive">{lp.name}</p>
              <p className="text-xs text-destructive/80 mt-1">No stories cover this LP</p>
            </div>
          ))}
          {leadershipPrinciples.filter(lp => coverage[lp.id].total === 0).length === 0 && (
            <p className="text-success col-span-full">✅ All LPs have at least one story!</p>
          )}
        </div>
      </div>
    </div>
  );
};

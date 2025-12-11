import { leadershipPrinciples, getLP } from '@/data/leadershipPrinciples';
import { Story } from '@/types/story';
import { cn } from '@/lib/utils';

interface LPCoverageSummaryProps {
  stories: Story[];
}

export const LPCoverageSummary = ({ stories }: LPCoverageSummaryProps) => {
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

  return (
    <div className="bg-card rounded-xl shadow-lg border border-border p-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Leadership Principle Coverage</h3>
      <div className="flex flex-wrap gap-2">
        {leadershipPrinciples.map(lp => {
          const cov = coverage[lp.id];
          const colorClass = cov.total === 0 
            ? 'bg-destructive/15 text-destructive border-destructive/30' 
            : cov.total === 1 
            ? 'bg-warning/15 text-warning border-warning/30' 
            : 'bg-success/15 text-success border-success/30';
          return (
            <div 
              key={lp.id} 
              className={cn('px-2 py-1 rounded-md border text-xs font-medium', colorClass)} 
              title={`${lp.name}: ${cov.primary} primary, ${cov.secondary} secondary`}
            >
              {lp.short}: {cov.total}
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-destructive/15 border border-destructive/30"></span> 
          No coverage
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-warning/15 border border-warning/30"></span> 
          1 story
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-success/15 border border-success/30"></span> 
          2+ stories
        </span>
      </div>
    </div>
  );
};

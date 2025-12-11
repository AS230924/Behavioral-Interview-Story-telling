-- Create stories table
CREATE TABLE public.stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT,
  role TEXT,
  situation TEXT NOT NULL,
  task TEXT NOT NULL,
  action TEXT NOT NULL,
  result TEXT NOT NULL,
  metrics TEXT[] DEFAULT '{}',
  primary_lps TEXT[] DEFAULT '{}',
  secondary_lps TEXT[] DEFAULT '{}',
  strength INTEGER DEFAULT 0,
  questions_matched TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create evaluations table
CREATE TABLE public.evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  target_level TEXT NOT NULL DEFAULT 'L6',
  amazon_rating TEXT,
  total_score INTEGER,
  score_breakdown JSONB,
  star_scores JSONB,
  i_vs_we_analysis JSONB,
  metrics_quality JSONB,
  scope_assessment JSONB,
  senior_signals JSONB,
  red_flags TEXT[] DEFAULT '{}',
  must_have_checklist JSONB,
  summary TEXT,
  top_strengths TEXT[] DEFAULT '{}',
  critical_improvements TEXT[] DEFAULT '{}',
  rewrite_suggestions JSONB,
  interview_tip TEXT,
  lp_labels JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, target_level)
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required for now)
CREATE POLICY "Anyone can view stories" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Anyone can create stories" ON public.stories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update stories" ON public.stories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete stories" ON public.stories FOR DELETE USING (true);

CREATE POLICY "Anyone can view evaluations" ON public.evaluations FOR SELECT USING (true);
CREATE POLICY "Anyone can create evaluations" ON public.evaluations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update evaluations" ON public.evaluations FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete evaluations" ON public.evaluations FOR DELETE USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON public.evaluations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
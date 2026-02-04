-- Add user_id column to stories table
ALTER TABLE public.stories 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Anyone can create stories" ON public.stories;
DROP POLICY IF EXISTS "Anyone can delete stories" ON public.stories;
DROP POLICY IF EXISTS "Anyone can update stories" ON public.stories;
DROP POLICY IF EXISTS "Anyone can view stories" ON public.stories;

-- Create user-scoped RLS policies
CREATE POLICY "Users can view their own stories"
ON public.stories
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stories"
ON public.stories
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stories"
ON public.stories
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stories"
ON public.stories
FOR DELETE
USING (auth.uid() = user_id);

-- Update evaluations policies to be user-scoped through stories
DROP POLICY IF EXISTS "Anyone can create evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Anyone can delete evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Anyone can update evaluations" ON public.evaluations;
DROP POLICY IF EXISTS "Anyone can view evaluations" ON public.evaluations;

CREATE POLICY "Users can view evaluations for their stories"
ON public.evaluations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = evaluations.story_id 
    AND stories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create evaluations for their stories"
ON public.evaluations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = evaluations.story_id 
    AND stories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update evaluations for their stories"
ON public.evaluations
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = evaluations.story_id 
    AND stories.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete evaluations for their stories"
ON public.evaluations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE stories.id = evaluations.story_id 
    AND stories.user_id = auth.uid()
  )
);
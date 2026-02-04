import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Story } from '@/types/story';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchStories = async () => {
    if (!user) {
      setStories([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedStories: Story[] = (data || []).map(row => ({
        id: row.id,
        title: row.title,
        company: row.company || '',
        role: row.role || '',
        situation: row.situation,
        task: row.task,
        action: row.action,
        result: row.result,
        metrics: row.metrics || [],
        primaryLPs: row.primary_lps || [],
        secondaryLPs: row.secondary_lps || [],
        strength: row.strength || 0,
        questionsMatched: row.questions_matched || []
      }));

      setStories(mappedStories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveStory = async (story: Story): Promise<Story | null> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to save stories',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const storyData = {
        id: story.id,
        user_id: user.id,
        title: story.title,
        company: story.company,
        role: story.role,
        situation: story.situation,
        task: story.task,
        action: story.action,
        result: story.result,
        metrics: story.metrics,
        primary_lps: story.primaryLPs,
        secondary_lps: story.secondaryLPs,
        strength: story.strength,
        questions_matched: story.questionsMatched
      };

      const { data, error } = await supabase
        .from('stories')
        .upsert(storyData)
        .select()
        .single();

      if (error) throw error;

      const savedStory: Story = {
        id: data.id,
        title: data.title,
        company: data.company || '',
        role: data.role || '',
        situation: data.situation,
        task: data.task,
        action: data.action,
        result: data.result,
        metrics: data.metrics || [],
        primaryLPs: data.primary_lps || [],
        secondaryLPs: data.secondary_lps || [],
        strength: data.strength || 0,
        questionsMatched: data.questions_matched || []
      };

      setStories(prev => {
        const exists = prev.find(s => s.id === savedStory.id);
        if (exists) {
          return prev.map(s => s.id === savedStory.id ? savedStory : s);
        }
        return [savedStory, ...prev];
      });

      toast({
        title: 'Success',
        description: 'Story saved successfully'
      });

      return savedStory;
    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: 'Error',
        description: 'Failed to save story',
        variant: 'destructive'
      });
      return null;
    }
  };

  const deleteStory = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStories(prev => prev.filter(s => s.id !== id));

      toast({
        title: 'Success',
        description: 'Story deleted'
      });

      return true;
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete story',
        variant: 'destructive'
      });
      return false;
    }
  };

  useEffect(() => {
    fetchStories();
  }, [user]);

  return {
    stories,
    loading,
    saveStory,
    deleteStory,
    refetch: fetchStories
  };
};

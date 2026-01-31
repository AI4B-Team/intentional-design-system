-- Create feedback types enum
CREATE TYPE feedback_type AS ENUM ('general', 'bug', 'feature');
CREATE TYPE bug_severity AS ENUM ('low', 'medium', 'high');
CREATE TYPE feedback_status AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'planned', 'completed');

-- Main feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  organization_id UUID REFERENCES public.organizations(id),
  type feedback_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  severity bug_severity, -- Only for bugs
  status feedback_status NOT NULL DEFAULT 'open',
  attachments JSONB DEFAULT '[]'::jsonb, -- URLs to uploaded files
  vote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  similarity_group UUID, -- For grouping similar bugs
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Votes table for feature requests
CREATE TABLE public.feedback_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(feedback_id, user_id)
);

-- Comments table
CREATE TABLE public.feedback_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_id UUID NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feedback (anyone in org can view, create their own)
CREATE POLICY "Users can view all feedback" 
ON public.feedback FOR SELECT 
USING (true);

CREATE POLICY "Users can create feedback" 
ON public.feedback FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" 
ON public.feedback FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for votes
CREATE POLICY "Users can view all votes" 
ON public.feedback_votes FOR SELECT 
USING (true);

CREATE POLICY "Users can vote" 
ON public.feedback_votes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their vote" 
ON public.feedback_votes FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view all comments" 
ON public.feedback_comments FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.feedback_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.feedback_comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.feedback_comments FOR DELETE 
USING (auth.uid() = user_id);

-- Function to update vote count
CREATE OR REPLACE FUNCTION public.update_feedback_vote_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feedback SET vote_count = vote_count + 1, updated_at = now() WHERE id = NEW.feedback_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feedback SET vote_count = vote_count - 1, updated_at = now() WHERE id = OLD.feedback_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update comment count
CREATE OR REPLACE FUNCTION public.update_feedback_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feedback SET comment_count = comment_count + 1, updated_at = now() WHERE id = NEW.feedback_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feedback SET comment_count = comment_count - 1, updated_at = now() WHERE id = OLD.feedback_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers
CREATE TRIGGER update_vote_count
AFTER INSERT OR DELETE ON public.feedback_votes
FOR EACH ROW EXECUTE FUNCTION public.update_feedback_vote_count();

CREATE TRIGGER update_comment_count
AFTER INSERT OR DELETE ON public.feedback_comments
FOR EACH ROW EXECUTE FUNCTION public.update_feedback_comment_count();

-- Create storage bucket for feedback attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('feedback-attachments', 'feedback-attachments', true);

-- Storage policies
CREATE POLICY "Anyone can view feedback attachments" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'feedback-attachments');

CREATE POLICY "Authenticated users can upload feedback attachments" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'feedback-attachments' AND auth.role() = 'authenticated');

-- Index for performance
CREATE INDEX idx_feedback_type ON public.feedback(type);
CREATE INDEX idx_feedback_status ON public.feedback(status);
CREATE INDEX idx_feedback_similarity_group ON public.feedback(similarity_group);
CREATE INDEX idx_feedback_votes_feedback_id ON public.feedback_votes(feedback_id);
CREATE INDEX idx_feedback_comments_feedback_id ON public.feedback_comments(feedback_id);
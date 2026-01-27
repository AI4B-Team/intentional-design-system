
-- Add organization_id to achievements table
ALTER TABLE public.achievements 
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Add index for organization achievements
CREATE INDEX IF NOT EXISTS idx_achievements_org ON public.achievements(organization_id);

-- Update activity_points table to include organization_id and entity_id
ALTER TABLE public.activity_points 
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS entity_id uuid;

-- Add index for organization activity points
CREATE INDEX IF NOT EXISTS idx_activity_points_org ON public.activity_points(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_points_created ON public.activity_points(created_at DESC);

-- Update RLS policies for activity_points to support org-level queries
DROP POLICY IF EXISTS "Users can view all activity points" ON public.activity_points;
CREATE POLICY "Users can view org activity points"
ON public.activity_points FOR SELECT
USING (
  (organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  ))
  OR organization_id IS NULL
  OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "Users can insert their own activity points" ON public.activity_points;
CREATE POLICY "Users can insert activity points"
ON public.activity_points FOR INSERT
WITH CHECK (
  auth.uid() = user_id
);

-- Create gamification_settings table for admin configuration
CREATE TABLE IF NOT EXISTS public.gamification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL UNIQUE,
  enabled boolean DEFAULT true,
  point_values jsonb DEFAULT '{
    "lead_added": 10,
    "skip_trace": 5,
    "contact_made": 15,
    "appointment_set": 25,
    "appointment_completed": 20,
    "offer_made": 30,
    "offer_accepted": 50,
    "deal_closed": 100,
    "deal_closed_10k_bonus": 50,
    "deal_closed_25k_bonus": 100,
    "streak_7_day": 25,
    "streak_30_day": 100
  }'::jsonb,
  streak_requirements jsonb DEFAULT '{"daily_minimum_points": 10}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on gamification_settings
ALTER TABLE public.gamification_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for gamification_settings
CREATE POLICY "Users can view org gamification settings"
ON public.gamification_settings FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Admins can manage gamification settings"
ON public.gamification_settings FOR ALL
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active' AND role IN ('owner', 'admin')
  )
);

-- Create user_streaks table for tracking activity streaks
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_activity_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Enable RLS on user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_streaks
CREATE POLICY "Users can view org streaks"
ON public.user_streaks FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM organization_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
  OR user_id = auth.uid()
);

CREATE POLICY "Users can manage their own streaks"
ON public.user_streaks FOR ALL
USING (user_id = auth.uid());

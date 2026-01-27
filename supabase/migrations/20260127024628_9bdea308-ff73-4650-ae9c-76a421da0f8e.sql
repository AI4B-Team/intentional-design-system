-- =============================================
-- GAMIFICATION SYSTEM TABLES
-- =============================================

-- Achievements table (system-wide definitions)
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🏆',
    category TEXT NOT NULL CHECK (category IN ('deals', 'profit', 'speed', 'activity', 'special')),
    threshold INTEGER NOT NULL DEFAULT 1,
    points INTEGER NOT NULL DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- User achievements (earned achievements)
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ DEFAULT now(),
    deal_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    UNIQUE(user_id, achievement_id)
);

-- Activity points (individual point awards)
CREATE TABLE public.activity_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('lead_added', 'contact_made', 'appointment_set', 'offer_sent', 'deal_closed', 'achievement_bonus')),
    points INTEGER NOT NULL DEFAULT 0,
    reference_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_points ENABLE ROW LEVEL SECURITY;

-- RLS Policies for achievements (read-only for all authenticated users)
CREATE POLICY "Anyone can view achievements" 
ON public.achievements FOR SELECT TO authenticated 
USING (true);

-- RLS Policies for user_achievements
CREATE POLICY "Users can view all user achievements" 
ON public.user_achievements FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity_points
CREATE POLICY "Users can view all activity points" 
ON public.activity_points FOR SELECT TO authenticated 
USING (true);

CREATE POLICY "Users can insert their own activity points" 
ON public.activity_points FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- =============================================
-- SEED ACHIEVEMENTS DATA
-- =============================================

-- Deal Milestones
INSERT INTO public.achievements (code, name, description, icon, category, threshold, points) VALUES
('first_deal', 'First Blood', 'Close your first deal', '🩸', 'deals', 1, 100),
('5_deals', 'Getting Started', 'Close 5 deals', '🚀', 'deals', 5, 250),
('10_deals', 'Double Digits', 'Close 10 deals', '🔟', 'deals', 10, 500),
('25_deals', 'Deal Machine', 'Close 25 deals', '⚙️', 'deals', 25, 1000),
('100_deals', 'Centurion', 'Close 100 deals', '💯', 'deals', 100, 5000);

-- Profit Milestones
INSERT INTO public.achievements (code, name, description, icon, category, threshold, points) VALUES
('10k_profit', '$10K Club', 'Earn $10,000 total profit', '💵', 'profit', 10000, 200),
('50k_profit', '$50K Club', 'Earn $50,000 total profit', '💰', 'profit', 50000, 500),
('100k_profit', '$100K Club', 'Earn $100,000 total profit', '🤑', 'profit', 100000, 1000),
('250k_profit', 'Quarter Million', 'Earn $250,000 total profit', '💎', 'profit', 250000, 2500);

-- Speed Achievements
INSERT INTO public.achievements (code, name, description, icon, category, threshold, points) VALUES
('speed_demon', 'Speed Demon', 'Close a deal in under 14 days', '⚡', 'speed', 14, 300),
('quick_draw', 'Quick Draw', 'Make an offer within 1 hour of lead receipt', '🎯', 'speed', 1, 100),
('same_day', 'Same Day', 'Contact lead same day received', '📞', 'speed', 1, 50);

-- Activity Achievements
INSERT INTO public.achievements (code, name, description, icon, category, threshold, points) VALUES
('dialer', 'Dialer', 'Make 100 contacts', '☎️', 'activity', 100, 200),
('persistence', 'Persistence', 'Maintain a 7-day contact streak', '🔥', 'activity', 7, 150),
('offer_machine', 'Offer Machine', 'Send 50 offers', '📝', 'activity', 50, 300);

-- Special Achievements
INSERT INTO public.achievements (code, name, description, icon, category, threshold, points) VALUES
('creative_closer', 'Creative Closer', 'Close a creative finance deal', '🎨', 'special', 1, 200),
('big_fish', 'Big Fish', 'Close a deal with $25K+ profit', '🐋', 'special', 25000, 500),
('perfect_month', 'Perfect Month', 'Close 5+ deals in one month', '📅', 'special', 5, 1000);

-- Create indexes for performance
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_activity_points_user_id ON public.activity_points(user_id);
CREATE INDEX idx_activity_points_created_at ON public.activity_points(created_at);
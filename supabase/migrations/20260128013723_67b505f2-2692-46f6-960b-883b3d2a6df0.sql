-- Driving sessions table (each driving trip)
CREATE TABLE public.driving_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  -- Session info
  name text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  
  -- Timing
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  total_duration_seconds integer DEFAULT 0,
  active_duration_seconds integer DEFAULT 0,
  
  -- Route data
  route_polyline text,
  route_coordinates jsonb DEFAULT '[]',
  
  -- Stats
  total_miles decimal DEFAULT 0,
  properties_tagged integer DEFAULT 0,
  photos_taken integer DEFAULT 0,
  notes_recorded integer DEFAULT 0,
  
  -- Location bounds (for heat map)
  bounds_north decimal,
  bounds_south decimal,
  bounds_east decimal,
  bounds_west decimal,
  
  -- Weather (optional)
  weather_conditions text,
  temperature_f integer,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- D4D Properties table (properties tagged while driving)
CREATE TABLE public.d4d_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  session_id uuid REFERENCES public.driving_sessions ON DELETE SET NULL,
  
  -- Location (captured from GPS)
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  
  -- Address (reverse geocoded)
  address text,
  street_number text,
  street_name text,
  city text,
  state text,
  zip text,
  county text,
  formatted_address text,
  
  -- Property observations
  property_type text DEFAULT 'sfh' CHECK (property_type IN ('sfh', 'multi', 'condo', 'townhouse', 'land', 'commercial', 'unknown')),
  condition text CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'distressed', 'vacant', 'boarded')),
  occupancy text CHECK (occupancy IN ('occupied', 'vacant', 'unknown')),
  
  -- Distress indicators (quick checkboxes while driving)
  has_overgrown_lawn boolean DEFAULT false,
  has_mail_pileup boolean DEFAULT false,
  has_boarded_windows boolean DEFAULT false,
  has_code_violations boolean DEFAULT false,
  has_roof_damage boolean DEFAULT false,
  has_peeling_paint boolean DEFAULT false,
  has_broken_windows boolean DEFAULT false,
  has_abandoned_vehicles boolean DEFAULT false,
  has_for_sale_sign boolean DEFAULT false,
  has_notice_on_door boolean DEFAULT false,
  
  -- Tags
  tags text[] DEFAULT '{}',
  
  -- Notes
  voice_note_url text,
  voice_note_transcript text,
  written_notes text,
  
  -- Photos
  photos jsonb DEFAULT '[]',
  
  -- Priority/Rating
  priority integer DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  
  -- Sync status
  synced_to_property_id uuid REFERENCES public.properties ON DELETE SET NULL,
  sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'skipped', 'duplicate')),
  synced_at timestamptz,
  
  -- Timestamps
  tagged_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- D4D Route Points table (GPS breadcrumbs)
CREATE TABLE public.d4d_route_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.driving_sessions ON DELETE CASCADE NOT NULL,
  
  latitude decimal NOT NULL,
  longitude decimal NOT NULL,
  altitude decimal,
  accuracy decimal,
  speed decimal,
  heading decimal,
  
  recorded_at timestamptz DEFAULT now()
);

-- D4D Mileage Log table (for tax deductions)
CREATE TABLE public.d4d_mileage_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  session_id uuid REFERENCES public.driving_sessions ON DELETE SET NULL,
  
  date date NOT NULL,
  description text,
  
  start_odometer decimal,
  end_odometer decimal,
  calculated_miles decimal,
  final_miles decimal,
  
  mileage_rate decimal DEFAULT 0.67,
  deduction_amount decimal,
  
  purpose text DEFAULT 'business',
  notes text,
  
  created_at timestamptz DEFAULT now()
);

-- D4D Areas table (saved neighborhoods)
CREATE TABLE public.d4d_areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  name text NOT NULL,
  description text,
  
  boundary_coordinates jsonb,
  center_lat decimal,
  center_lng decimal,
  
  times_driven integer DEFAULT 0,
  total_miles_driven decimal DEFAULT 0,
  properties_tagged integer DEFAULT 0,
  last_driven_at timestamptz,
  
  color text DEFAULT '#3B82F6',
  is_favorite boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_driving_sessions_user ON public.driving_sessions(user_id);
CREATE INDEX idx_driving_sessions_org ON public.driving_sessions(organization_id);
CREATE INDEX idx_driving_sessions_status ON public.driving_sessions(status);

CREATE INDEX idx_d4d_properties_user ON public.d4d_properties(user_id);
CREATE INDEX idx_d4d_properties_org ON public.d4d_properties(organization_id);
CREATE INDEX idx_d4d_properties_session ON public.d4d_properties(session_id);
CREATE INDEX idx_d4d_properties_location ON public.d4d_properties(latitude, longitude);
CREATE INDEX idx_d4d_properties_sync ON public.d4d_properties(sync_status);

CREATE INDEX idx_route_points_session ON public.d4d_route_points(session_id, recorded_at);

CREATE INDEX idx_mileage_log_user ON public.d4d_mileage_log(user_id);
CREATE INDEX idx_mileage_log_date ON public.d4d_mileage_log(date);

CREATE INDEX idx_d4d_areas_user ON public.d4d_areas(user_id);
CREATE INDEX idx_d4d_areas_org ON public.d4d_areas(organization_id);

-- Enable RLS
ALTER TABLE public.driving_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.d4d_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.d4d_route_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.d4d_mileage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.d4d_areas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for driving_sessions
CREATE POLICY "Users manage own sessions" ON public.driving_sessions
  FOR ALL USING (
    (organization_id IS NULL AND auth.uid() = user_id)
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
  );

-- RLS Policies for d4d_properties
CREATE POLICY "Users manage own d4d properties" ON public.d4d_properties
  FOR ALL USING (
    (organization_id IS NULL AND auth.uid() = user_id)
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
  );

-- RLS Policies for d4d_route_points
CREATE POLICY "Users view own route points" ON public.d4d_route_points
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM public.driving_sessions 
      WHERE (organization_id IS NULL AND user_id = auth.uid())
         OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    )
  );

CREATE POLICY "Users insert own route points" ON public.d4d_route_points
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM public.driving_sessions 
      WHERE (organization_id IS NULL AND user_id = auth.uid())
         OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    )
  );

CREATE POLICY "Users delete own route points" ON public.d4d_route_points
  FOR DELETE USING (
    session_id IN (
      SELECT id FROM public.driving_sessions 
      WHERE (organization_id IS NULL AND user_id = auth.uid())
         OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
    )
  );

-- RLS Policies for d4d_mileage_log
CREATE POLICY "Users manage own mileage" ON public.d4d_mileage_log
  FOR ALL USING (
    (organization_id IS NULL AND auth.uid() = user_id)
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
  );

-- RLS Policies for d4d_areas
CREATE POLICY "Users manage own areas" ON public.d4d_areas
  FOR ALL USING (
    (organization_id IS NULL AND auth.uid() = user_id)
    OR (organization_id IS NOT NULL AND public.is_org_member(organization_id))
  );

-- Update triggers
CREATE TRIGGER update_driving_sessions_updated_at
  BEFORE UPDATE ON public.driving_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_d4d_properties_updated_at
  BEFORE UPDATE ON public.d4d_properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_d4d_areas_updated_at
  BEFORE UPDATE ON public.d4d_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function: Calculate distance between coordinates (Haversine formula)
CREATE OR REPLACE FUNCTION public.calculate_distance_miles(
  lat1 decimal, lng1 decimal,
  lat2 decimal, lng2 decimal
)
RETURNS decimal AS $$
DECLARE
  r decimal := 3959;
  dlat decimal;
  dlng decimal;
  a decimal;
  c decimal;
BEGIN
  dlat := radians(lat2 - lat1);
  dlng := radians(lng2 - lng1);
  a := sin(dlat/2)^2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng/2)^2;
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE SET search_path = public;

-- Storage bucket for D4D photos
INSERT INTO storage.buckets (id, name, public) VALUES ('d4d-photos', 'd4d-photos', false);

-- Storage policies
CREATE POLICY "Users can upload d4d photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'd4d-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own d4d photos" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'd4d-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own d4d photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'd4d-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
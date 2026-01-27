-- Create renovation_projects table
CREATE TABLE public.renovation_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  property_id uuid REFERENCES public.properties ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  cover_image_url text,
  total_images integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create renovation_images table
CREATE TABLE public.renovation_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.renovation_projects ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  -- Original image
  original_image_url text NOT NULL,
  original_image_key text,
  
  -- Room/area info
  room_type text,
  area_label text,
  
  -- Generated images (can have multiple variations)
  generated_images jsonb DEFAULT '[]',
  
  -- Current selected "after" image
  selected_after_url text,
  selected_after_id text,
  
  -- Metadata
  width integer,
  height integer,
  
  -- Credits used
  total_credits_used decimal DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create material_library table
CREATE TABLE public.material_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  name text NOT NULL,
  category text NOT NULL,
  
  -- Source
  image_url text NOT NULL,
  image_key text,
  source_url text,
  source_name text,
  
  -- Details
  brand text,
  product_name text,
  color text,
  price_per_unit decimal,
  unit text,
  
  -- For AI prompting
  material_description text,
  
  is_favorite boolean DEFAULT false,
  use_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- Create renovation_presets table
CREATE TABLE public.renovation_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  room_types text[],
  
  -- Preset configuration
  style_prompt text NOT NULL,
  example_image_url text,
  
  -- Materials included
  suggested_materials jsonb DEFAULT '{}',
  
  is_system boolean DEFAULT true,
  user_id uuid,
  organization_id uuid REFERENCES public.organizations ON DELETE CASCADE,
  
  popularity integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Insert default system presets
INSERT INTO public.renovation_presets (name, description, category, room_types, style_prompt, is_system) VALUES
('Modern Minimalist', 'Clean lines, neutral colors, minimal furniture', 'modern', ARRAY['living_room', 'bedroom', 'kitchen'], 'modern minimalist interior design, clean lines, neutral colors, white walls, minimal furniture, natural light, scandinavian influence', true),
('Farmhouse Chic', 'Rustic warmth with modern comfort', 'farmhouse', ARRAY['living_room', 'bedroom', 'kitchen', 'bathroom'], 'modern farmhouse interior, shiplap walls, warm wood tones, cozy textiles, vintage accents, white and natural wood', true),
('Luxury Contemporary', 'High-end finishes, sophisticated style', 'luxury', ARRAY['living_room', 'bedroom', 'kitchen', 'bathroom'], 'luxury contemporary interior, high-end finishes, marble accents, designer furniture, ambient lighting, sophisticated color palette', true),
('Coastal Retreat', 'Light, airy beach-inspired design', 'coastal', ARRAY['living_room', 'bedroom', 'bathroom'], 'coastal interior design, light blue and white palette, natural textures, beach-inspired decor, airy and bright, linen fabrics', true),
('Industrial Loft', 'Urban edge with exposed elements', 'industrial', ARRAY['living_room', 'bedroom', 'kitchen'], 'industrial loft interior, exposed brick, metal accents, concrete floors, Edison bulbs, urban modern furniture', true),
('Budget Refresh', 'Maximum impact, minimal cost', 'budget-friendly', ARRAY['living_room', 'bedroom', 'kitchen', 'bathroom'], 'clean updated interior, fresh paint, decluttered, bright and welcoming, simple modern furniture, good natural light', true);

-- Enable RLS
ALTER TABLE public.renovation_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovation_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.renovation_presets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for renovation_projects
CREATE POLICY "Users manage own projects" ON public.renovation_projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Org members can view org projects" ON public.renovation_projects
  FOR SELECT USING (public.is_org_member(organization_id));

-- RLS Policies for renovation_images
CREATE POLICY "Users manage own images" ON public.renovation_images
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Org members can view org images" ON public.renovation_images
  FOR SELECT USING (public.is_org_member(organization_id));

-- RLS Policies for material_library
CREATE POLICY "Users manage own materials" ON public.material_library
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Org members can view org materials" ON public.material_library
  FOR SELECT USING (public.is_org_member(organization_id));

-- RLS Policies for renovation_presets
CREATE POLICY "Anyone can view system presets" ON public.renovation_presets
  FOR SELECT USING (is_system = true);

CREATE POLICY "Users manage own presets" ON public.renovation_presets
  FOR ALL USING (auth.uid() = user_id AND is_system = false);

-- Create updated_at triggers
CREATE TRIGGER update_renovation_projects_updated_at
  BEFORE UPDATE ON public.renovation_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_renovation_images_updated_at
  BEFORE UPDATE ON public.renovation_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_renovation_projects_user_id ON public.renovation_projects(user_id);
CREATE INDEX idx_renovation_projects_property_id ON public.renovation_projects(property_id);
CREATE INDEX idx_renovation_projects_organization_id ON public.renovation_projects(organization_id);
CREATE INDEX idx_renovation_images_project_id ON public.renovation_images(project_id);
CREATE INDEX idx_renovation_images_user_id ON public.renovation_images(user_id);
CREATE INDEX idx_material_library_user_id ON public.material_library(user_id);
CREATE INDEX idx_material_library_category ON public.material_library(category);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('renovation-originals', 'renovation-originals', false),
  ('renovation-generated', 'renovation-generated', false),
  ('material-library', 'material-library', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for renovation-originals
CREATE POLICY "Users can upload own originals" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'renovation-originals' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own originals" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'renovation-originals' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own originals" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'renovation-originals' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for renovation-generated
CREATE POLICY "Users can upload own generated" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'renovation-generated' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own generated" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'renovation-generated' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own generated" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'renovation-generated' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for material-library
CREATE POLICY "Users can upload own materials" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'material-library' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own materials" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'material-library' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own materials" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'material-library' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
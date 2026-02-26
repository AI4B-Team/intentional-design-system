
-- Create dispo-photos storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('dispo-photos', 'dispo-photos', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload dispo photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dispo-photos' AND auth.uid() IS NOT NULL);

-- Allow public read access
CREATE POLICY "Public can view dispo photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'dispo-photos');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own dispo photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'dispo-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

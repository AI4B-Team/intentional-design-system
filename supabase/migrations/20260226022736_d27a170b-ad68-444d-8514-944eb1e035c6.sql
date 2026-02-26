
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-recordings', 'voice-recordings', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can read voice recordings"
ON storage.objects FOR SELECT
USING (bucket_id = 'voice-recordings');

CREATE POLICY "Authenticated users can upload voice recordings"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'voice-recordings' AND auth.role() = 'authenticated');

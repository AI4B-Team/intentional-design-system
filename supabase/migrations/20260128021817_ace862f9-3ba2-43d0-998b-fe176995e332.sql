-- Create storage bucket for list uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'list-uploads',
  'list-uploads',
  true,
  52428800, -- 50MB limit
  ARRAY['text/csv', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
) ON CONFLICT (id) DO NOTHING;

-- RLS policies for list-uploads bucket
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload list files to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'list-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own uploaded files
CREATE POLICY "Users can read own list files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'list-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own list files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'list-uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Public read access for processing (edge function needs this)
CREATE POLICY "Public read access for list processing"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'list-uploads');
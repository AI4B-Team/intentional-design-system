-- Create storage bucket for list uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('list-uploads', 'list-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for list-uploads bucket
-- Allow authenticated users to upload files in their own folder
CREATE POLICY "Users can upload list files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'list-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own files
CREATE POLICY "Users can read their own list files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'list-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow service role to read all files (for edge function)
CREATE POLICY "Service can read all list files"
ON storage.objects
FOR SELECT
USING (bucket_id = 'list-uploads');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own list files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'list-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
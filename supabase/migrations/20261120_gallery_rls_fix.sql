-- Fix Row-Level Security (RLS) for gallery_images and storage.objects in Supabase / OnSpace backend
-- Run this script in your Supabase SQL Editor if you want direct anonymous access to gallery tables and storage.

-- 1. Configure public access for gallery_images table
ALTER TABLE IF EXISTS public.gallery_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow public insert gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow public update gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow public delete gallery_images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow public all access on gallery_images" ON public.gallery_images;

CREATE POLICY "Allow public all access on gallery_images"
ON public.gallery_images
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 2. Configure public access for storage bucket 'gallery'
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public select storage gallery" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert storage gallery" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update storage gallery" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete storage gallery" ON storage.objects;
DROP POLICY IF EXISTS "Allow public all storage gallery" ON storage.objects;

CREATE POLICY "Allow public all storage gallery"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

-- 3. Configure public access for story_banners table
ALTER TABLE IF EXISTS public.story_banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public all access on story_banners" ON public.story_banners;
CREATE POLICY "Allow public all access on story_banners"
ON public.story_banners
FOR ALL
TO public
USING (true)
WITH CHECK (true);

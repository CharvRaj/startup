import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

interface ImportRequest {
  driveLinks: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const { driveLinks }: ImportRequest = await req.json();

    if (!driveLinks || !Array.isArray(driveLinks) || driveLinks.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No drive links provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting import of ${driveLinks.length} images...`);

    const results = [];
    const errors = [];

    for (let i = 0; i < driveLinks.length; i++) {
      const link = driveLinks[i];
      
      try {
        // Extract file ID from Google Drive link
        const fileIdMatch = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (!fileIdMatch) {
          errors.push({ link, error: 'Invalid Google Drive link format' });
          continue;
        }

        const fileId = fileIdMatch[1];
        
        // Convert to direct download URL
        const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        
        console.log(`Downloading image ${i + 1}/${driveLinks.length}: ${fileId}`);

        // Download the image
        const imageResponse = await fetch(directUrl);
        
        if (!imageResponse.ok) {
          errors.push({ link, error: `Failed to download: ${imageResponse.statusText}` });
          continue;
        }

        // Get the image blob
        const imageBlob = await imageResponse.blob();
        
        // Determine file extension from content type
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
        let extension = 'jpg';
        if (contentType.includes('png')) extension = 'png';
        else if (contentType.includes('webp')) extension = 'webp';
        else if (contentType.includes('gif')) extension = 'gif';

        // Create unique filename
        const fileName = `gallery_${Date.now()}_${i + 1}.${extension}`;
        const filePath = `gallery/${fileName}`;

        console.log(`Uploading to storage: ${filePath}`);

        // Upload to Supabase Storage
        const { error: uploadError } = await supabaseAdmin.storage
          .from('gallery')
          .upload(filePath, imageBlob, {
            contentType,
            upsert: false,
          });

        if (uploadError) {
          console.error(`Upload error for ${fileId}:`, uploadError);
          errors.push({ link, error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('gallery')
          .getPublicUrl(filePath);

        // Insert into gallery_images table
        const { error: dbError } = await supabaseAdmin
          .from('gallery_images')
          .insert({
            title: `Gallery Image ${i + 1}`,
            url: publicUrl,
            storage_path: filePath,
            display_order: i,
          });

        if (dbError) {
          console.error(`Database error for ${fileId}:`, dbError);
          errors.push({ link, error: dbError.message });
          continue;
        }

        console.log(`Successfully imported: ${fileId}`);
        results.push({ fileId, publicUrl, success: true });

      } catch (error: any) {
        console.error(`Error processing ${link}:`, error);
        errors.push({ link, error: error.message });
      }
    }

    console.log(`Import complete. Success: ${results.length}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Import function error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

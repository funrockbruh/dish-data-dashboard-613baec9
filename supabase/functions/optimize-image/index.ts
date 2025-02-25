
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Sharp from 'https://esm.sh/sharp@0.32.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting image optimization');
    
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      throw new Error('No valid file provided');
    }

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Optimize the image
    const optimizedImageBuffer = await Sharp(new Uint8Array(arrayBuffer))
      .resize(800, 800, { // Max dimensions
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ // Convert to JPEG and compress
        quality: 80,
        progressive: true
      })
      .toBuffer();

    // Create new File from optimized buffer
    const optimizedFile = new File(
      [optimizedImageBuffer],
      file.name.replace(/\.[^/.]+$/, "") + "_optimized.jpg",
      { type: 'image/jpeg' }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw new Error('No token provided');
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    // Generate filename
    const fileName = `${user.id}/${crypto.randomUUID()}.jpg`;

    console.log('Uploading optimized file:', fileName);

    const { error: uploadError } = await supabaseAdmin.storage
      .from('menu-category-images')
      .upload(fileName, optimizedFile, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('menu-category-images')
      .getPublicUrl(fileName);

    console.log('Upload successful:', publicUrl);

    return new Response(
      JSON.stringify({ url: publicUrl }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to optimize image' 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    );
  }
});

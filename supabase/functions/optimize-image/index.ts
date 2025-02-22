
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import Sharp from 'https://esm.sh/sharp@0.32.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const category = formData.get('category') as string

    if (!file) {
      throw new Error('No file provided')
    }

    const buffer = await file.arrayBuffer()
    const sharp = new Sharp(new Uint8Array(buffer))

    // Optimize the image
    const optimizedBuffer = await sharp
      .resize(800, 800, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .webp({ quality: 80 })
      .toBuffer()

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const fileExt = 'webp'
    const userId = (await req.json()).userId
    const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`
    const bucketName = category === 'menu-item' ? 'menu-item-images' : 'menu-category-images'

    // Upload optimized image
    const { error: uploadError, data } = await supabase.storage
      .from(bucketName)
      .upload(filePath, optimizedBuffer, {
        contentType: 'image/webp',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath)

    return new Response(
      JSON.stringify({ 
        message: 'Image optimized and uploaded successfully',
        url: publicUrl
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process image',
        details: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400 
      }
    )
  }
})


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { decode, encode } from 'https://deno.land/x/imagescript@1.2.15/mod.ts'

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
    const image = await decode(new Uint8Array(buffer))

    // Resize image while maintaining aspect ratio
    const MAX_SIZE = 800
    let width = image.width
    let height = image.height

    if (width > MAX_SIZE || height > MAX_SIZE) {
      if (width > height) {
        height = Math.round((height * MAX_SIZE) / width)
        width = MAX_SIZE
      } else {
        width = Math.round((width * MAX_SIZE) / height)
        height = MAX_SIZE
      }
      image.resize(width, height)
    }

    // Optimize and encode image
    const optimizedBuffer = await encode(image, { quality: 80 })

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: { user } } = await supabase.auth.getUser(req.headers.get('Authorization')?.split('Bearer ')[1] ?? '')
    if (!user) throw new Error('Not authenticated')

    const fileName = `${user.id}/${crypto.randomUUID()}.jpg`
    const bucketName = category === 'menu-item' ? 'menu-item-images' : 'menu-category-images'

    // Upload optimized image
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, optimizedBuffer, {
        contentType: 'image/jpeg',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName)

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
    console.error('Error processing image:', error)
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

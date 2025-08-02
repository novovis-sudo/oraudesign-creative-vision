import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Replicate from "https://esm.sh/replicate@0.25.2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!REPLICATE_API_KEY) {
      throw new Error('REPLICATE_API_KEY is not configured')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
    const replicate = new Replicate({ auth: REPLICATE_API_KEY })

    const body = await req.json()
    const { imageUrl, prompt, negativePrompt, denoisingStrength, guidanceScale, seed, model } = body

    if (!imageUrl || !prompt) {
      return new Response(
        JSON.stringify({ error: "imageUrl and prompt are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log("Starting img2img generation with:", { prompt, model, denoisingStrength })

    // Use FLUX for img2img generation
    const output = await replicate.run(
      "black-forest-labs/flux-dev",
      {
        input: {
          image: imageUrl,
          prompt: prompt,
          guidance: guidanceScale || 3.5,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          prompt_strength: denoisingStrength || 0.8,
          num_inference_steps: 28,
          seed: seed && seed !== -1 ? seed : undefined
        }
      }
    )

    console.log("Replicate generation completed:", output)

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error("No output generated from Replicate")
    }

    const generatedImageUrl = output[0]

    // Download and upload to Supabase storage
    const imageResponse = await fetch(generatedImageUrl)
    if (!imageResponse.ok) {
      throw new Error("Failed to download generated image")
    }

    const imageBuffer = await imageResponse.arrayBuffer()
    const fileName = `generated_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('bucket1')
      .upload(`generated/${fileName}`, imageBuffer, {
        contentType: 'image/webp',
        upsert: false
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      throw new Error(`Failed to upload to storage: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('bucket1')
      .getPublicUrl(`generated/${fileName}`)

    console.log("Image uploaded successfully:", publicUrl)

    return new Response(
      JSON.stringify({
        success: true,
        outputUrl: publicUrl,
        generationParams: {
          prompt,
          negativePrompt,
          denoisingStrength,
          guidanceScale,
          seed: seed || null,
          model: model || 'flux-dev'
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error("Error in img2img generation:", error)
    return new Response(
      JSON.stringify({ 
        error: error.message || "Generation failed",
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
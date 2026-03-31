import { fal } from '@fal-ai/client'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60 // Vercel Pro allows up to 300s, Hobby up to 60s

fal.config({ credentials: process.env.FAL_KEY! })

type ProcessType =
  | 'professional'
  | 'declutter'
  | 'renovation'
  | 'relight-dawn'
  | 'relight-day'
  | 'relight-night'

function getPromptAndStrength(
  processType: ProcessType,
  userRequest?: string
): { prompt: string; strength: number } {
  switch (processType) {
    case 'professional':
      return {
        strength: 0.65,
        prompt: `Professional real estate photography enhancement. Correct lens distortion and vertical lines. Improve lighting naturally with soft balanced realistic light. Increase dynamic range subtly. Enhance sharpness and clarity. Improve color accuracy with neutral whites and realistic tones. Remove noise and compression artifacts. Add subtle depth and contrast for a premium high-end property listing look. Photorealistic, no overprocessing.`,
      }

    case 'declutter':
      return {
        strength: 0.65,
        prompt: `Clean and declutter this interior space for a property listing. Remove visible clutter, random objects, cables, and mess. Organize surfaces like tables, countertops, and shelves. Make the space feel breathable, clean, minimal, and attractive. Keep the same room layout and furniture. Realistic, neutral, looks like a well-kept home ready to sell.`,
      }

    case 'renovation':
      return {
        strength: 0.85,
        prompt: `Interior renovation of this space. Keep the exact structure, walls, windows, doors, and proportions. Transform the space with: ${userRequest || ''}. All changes must be realistic and physically possible. Materials must look real, no CGI feel. Photorealistic high-end interior design, clean and modern.`,
      }

    case 'relight-dawn':
      return {
        strength: 0.55,
        prompt: `Same room, only change the lighting. Early morning sunrise light. Warm soft golden tones entering from windows. Long soft shadows. Gentle atmospheric glow. Calm cozy morning feeling. Photorealistic lighting only.`,
      }

    case 'relight-day':
      return {
        strength: 0.55,
        prompt: `Same room, only change the lighting. Bright natural daylight. Neutral white sunlight. Clean shadows, well-balanced exposure. Interior evenly lit with soft natural bounce light. High-end real estate daylight look. Photorealistic.`,
      }

    case 'relight-night':
      return {
        strength: 0.55,
        prompt: `Same room, only change the lighting. Night environment outside with dark windows. Realistic warm interior lights turned on. Soft lamp and ceiling lighting glow. Cozy ambient atmosphere. Natural light falloff and shadows. Photorealistic only.`,
      }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image, imageBase64, mimeType, processType = 'professional', userRequest } = body
    const imgData = image || imageBase64

    if (!imgData) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    if (processType === 'renovation' && !userRequest) {
      return NextResponse.json(
        { error: 'userRequest is required for renovation mode' },
        { status: 400 }
      )
    }

    const { prompt, strength } = getPromptAndStrength(processType as ProcessType, userRequest)

    // Upload image to fal storage to get a public URL (fal.ai doesn't accept data URLs)
    const buffer = Buffer.from(imgData, 'base64')
    const blob = new Blob([buffer], { type: mimeType || 'image/jpeg' })
    const file = new File([blob], 'image.jpg', { type: mimeType || 'image/jpeg' })
    const uploadedUrl = await fal.storage.upload(file)

    const result = await fal.subscribe('fal-ai/flux/dev/image-to-image', {
      input: {
        image_url: uploadedUrl,
        prompt,
        strength,
      },
    })

    const outputUrl = (result as any).data?.images?.[0]?.url

    if (!outputUrl) {
      return NextResponse.json({ error: 'No image returned from fal.ai' }, { status: 500 })
    }

    // Download the result image and convert to base64
    const imageResponse = await fetch(outputUrl)
    const arrayBuffer = await imageResponse.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    return NextResponse.json({
      image: base64,
      mimeType: 'image/jpeg',
    })
  } catch (error: any) {
    console.error('Process error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    )
  }
}

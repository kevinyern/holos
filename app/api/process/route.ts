import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

type ProcessType =
  | 'professional'
  | 'declutter'
  | 'renovation'
  | 'relight-dawn'
  | 'relight-day'
  | 'relight-night'

function getPrompt(processType: ProcessType, userRequest?: string): string {
  switch (processType) {
    case 'professional':
      return `Professional real estate photo. Exact same room, exact same furniture, exact same angle. Only improve: white balance (clean neutral whites), exposure (bright and airy), color grading (warm natural tones), sharpness (crisp details), remove noise. Do NOT move or change any furniture. Do NOT add or remove objects. Photorealistic enhancement only. Result must look like the same photo taken by a professional photographer with a DSLR camera. Clean, bright, inviting, ready for property listing.`

    case 'declutter':
      return `Clean and declutter this interior space for a property listing. Remove visible clutter, random objects, cables, and mess. Organize surfaces like tables, countertops, and shelves. Make the space feel breathable, clean, minimal, and attractive. Keep the same room layout and furniture. Realistic, neutral, looks like a well-kept home ready to sell.`

    case 'renovation':
      return `Interior renovation of this space. Keep the exact structure, walls, windows, doors, and proportions. Transform the space with: ${userRequest || ''}. All changes must be realistic and physically possible. Materials must look real, no CGI feel. Photorealistic high-end interior design, clean and modern.`

    case 'relight-dawn':
      return `Same room, only change the lighting. Early morning sunrise light. Warm soft golden tones entering from windows. Long soft shadows. Gentle atmospheric glow. Calm cozy morning feeling. Photorealistic lighting only.`

    case 'relight-day':
      return `Same room, only change the lighting. Bright natural daylight. Neutral white sunlight. Clean shadows, well-balanced exposure. Interior evenly lit with soft natural bounce light. High-end real estate daylight look. Photorealistic.`

    case 'relight-night':
      return `Same room, only change the lighting. Night environment outside with dark windows. Realistic warm interior lights turned on. Soft lamp and ceiling lighting glow. Cozy ambient atmosphere. Natural light falloff and shadows. Photorealistic only.`
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

    const prompt = getPrompt(processType as ProcessType, userRequest)

    const model = genAI.getGenerativeModel({ model: 'gemini-3-pro-image-preview' })

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: mimeType || 'image/jpeg', data: imgData } }
        ]
      }],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
      } as any
    })

    const parts = result.response.candidates?.[0]?.content?.parts
    if (parts) {
      for (const part of parts) {
        if ((part as any).inlineData) {
          return NextResponse.json({
            image: (part as any).inlineData.data,
            mimeType: (part as any).inlineData.mimeType,
          })
        }
      }
    }

    return NextResponse.json({ error: 'No image returned from Gemini' }, { status: 500 })
  } catch (error: any) {
    console.error('Process error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    )
  }
}

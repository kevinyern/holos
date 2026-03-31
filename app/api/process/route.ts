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
      return `Transform this room photo into a professional real estate listing photo. Keep the exact same room, furniture layout, and camera angle. REQUIRED: Remove ALL clutter — clothes, bottles, random objects, cables, mess on surfaces. Make every surface clean and tidy. Straighten and align furniture and objects. ENHANCE: Improve lighting to bright and airy, fix white balance to clean neutral whites, boost colors subtly, increase sharpness. The result must show the same room but perfectly clean, tidy, and professionally lit — like it was staged and shot by a professional real estate photographer. Photorealistic, no CGI, no fake elements added.`

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

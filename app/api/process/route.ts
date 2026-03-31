import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

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
      return `You are a professional real estate photographer and image enhancer.
INPUT IMAGE: a mobile phone photo of a real interior space.
STRICT RULES:
- DO NOT change the layout, furniture, or objects.
- DO NOT move anything.
- DO NOT add or remove elements.
- Keep the exact same camera angle and composition.
TASK: Enhance the image to look like it was taken by a professional architectural photographer.
IMPROVEMENTS REQUIRED:
- Correct lens distortion and vertical lines (perfect perspective correction)
- Improve lighting naturally (soft, balanced, realistic light)
- Increase dynamic range (HDR effect but subtle and realistic)
- Enhance sharpness and clarity without artificial look
- Improve color accuracy (neutral whites, realistic tones)
- Remove noise and compression artifacts
- Add subtle depth and contrast for a premium look
STYLE: Photorealistic, natural real estate photography, no overprocessing, clean premium high-end property listing look.
OUTPUT: A high-resolution ultra-realistic professional real estate photo identical in composition but significantly improved in quality.`

    case 'declutter':
      return `You are a real estate staging expert.
INPUT IMAGE: a real interior space.
STRICT RULES:
- Keep the exact same room, layout, and camera angle.
- DO NOT change architecture.
- DO NOT add new furniture that does not exist.
- You may reorganize existing objects.
TASK: Clean and declutter the space to make it look tidy, minimal, and attractive for a property listing.
ACTIONS:
- Remove visible clutter (random objects, cables, mess)
- Organize surfaces (tables, countertops, shelves)
- Align furniture slightly if needed (but keep original pieces)
- Make the space feel breathable and clean
- Remove distractions but keep realism
STYLE: Minimal, clean, neutral, realistic, looks like a well-kept home ready to sell.
OUTPUT: Same room, same angle, but clean, organized, and visually appealing.`

    case 'renovation':
      return `You are an interior designer and architectural visualization expert.
INPUT IMAGE: a real interior space.
STRICT RULES:
- Keep the exact structure (walls, windows, doors, proportions)
- Maintain original camera angle and perspective
- Do NOT alter room dimensions
- Do NOT invent new architectural elements
TASK: Transform the space according to the following renovation instructions:
${userRequest || ''}
GUIDELINES:
- All changes must be realistic and physically possible
- Maintain correct lighting interaction with new materials
- Keep coherence with space proportions
- Materials must look real (no CGI feel)
STYLE: Photorealistic, high-end interior design, clean and modern.
OUTPUT: A realistic "after renovation" version of the same space.`

    case 'relight-dawn':
      return `Keep the exact same image, composition, and objects.
Only modify lighting conditions:
- Simulate early morning sunrise light
- Warm soft golden tones entering from windows
- Long soft shadows
- Gentle atmospheric glow
- Calm, cozy morning feeling
Keep everything else unchanged. Photorealistic lighting only.`

    case 'relight-day':
      return `Keep everything identical.
Modify only lighting:
- Bright natural daylight
- Neutral white sunlight
- Clean shadows, well-balanced exposure
- Interior evenly lit with soft natural bounce light
- High-end real estate daylight look
No changes to objects or layout.`

    case 'relight-night':
      return `Keep everything identical.
Modify only lighting:
- Night environment outside (dark windows)
- Turn on realistic interior lights (warm tones)
- Add soft lamp and ceiling lighting glow
- Create cozy ambient atmosphere
- Natural light falloff and shadows
No changes to furniture or structure. Photorealistic only.`
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: imgData,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseModalities: ['image', 'text'],
      } as any,
    })

    const response = result.response
    const parts = response.candidates?.[0]?.content?.parts

    if (!parts) {
      return NextResponse.json({ error: 'No response from Gemini' }, { status: 500 })
    }

    for (const part of parts) {
      if ((part as any).inlineData) {
        const inlineData = (part as any).inlineData
        return NextResponse.json({
          image: inlineData.data,
          mimeType: inlineData.mimeType,
        })
      }
    }

    return NextResponse.json({
      image: imgData,
      mimeType: mimeType || 'image/jpeg',
      note: 'Gemini did not return an enhanced image, returning original',
    })
  } catch (error: any) {
    console.error('Process error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    )
  }
}

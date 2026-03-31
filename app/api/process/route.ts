import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json()

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const prompt =
      'You are a professional real estate photo editor. Enhance this property photo to look professional: improve lighting, increase clarity, make colors more vibrant and appealing for real estate listings. Return only the enhanced image.'

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: image,
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

    // Look for an inline image in the response
    for (const part of parts) {
      if ((part as any).inlineData) {
        const inlineData = (part as any).inlineData
        return NextResponse.json({
          image: inlineData.data,
          mimeType: inlineData.mimeType,
        })
      }
    }

    // If Gemini didn't return an image, return the original with a note
    return NextResponse.json({
      image: image,
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

import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 300

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const PLAN_QUOTAS: Record<string, number> = {
  free: 10,
  starter: 100,
  pro: 500,
  agency: 2000,
}

type ProcessType =
  | 'professional'
  | 'declutter'
  | 'renovation'
  | 'relight-dawn'
  | 'relight-day'
  | 'relight-night'

function getPrompt(processType: ProcessType, userRequest?: string, style?: string, extras?: string[]): string {
  switch (processType) {
    case 'professional': {
      const styleLine = style && style !== 'none' ? `Decorative style: ${style}. ` : ''
      const extrasLines = extras && extras.length > 0 ? extras.join('. ') + '. ' : ''
      return `Architectural interior photography. Transform this photo into a stunning professional real estate photograph.
${extrasLines}${styleLine}
Correct perspective so all lines are perfectly straight. Clean and organize the scene: remove clutter, straighten objects. Use bright soft natural daylight, evenly illuminating the room with a clean airy look. Neutral whites, natural wood tones, high dynamic range, realistic lighting. Photorealistic professional real estate photo.`
    }

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
    // --- Auth: get userId from Supabase session (not from body) ---
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user: authUser } } = await supabaseAuth.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // --- Quota guard ---
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('plan, photos_used, quota_reset_at')
      .eq('id', authUser.id)
      .single()

    // Quota check — graceful: if columns don't exist yet, skip and allow
    if (!userError && userData && userData.photos_used != null) {
      // Reset quota if period expired
      if (userData.quota_reset_at && new Date(userData.quota_reset_at) <= new Date()) {
        await supabaseAdmin.from('users').update({
          photos_used: 0,
          quota_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }).eq('id', authUser.id)
        userData.photos_used = 0
      }

      const quota = PLAN_QUOTAS[userData.plan] ?? 3
      if (userData.photos_used >= quota) {
        return NextResponse.json({
          error: 'Quota exceeded',
          plan: userData.plan,
          used: userData.photos_used,
        }, { status: 429 })
      }

      // Increment photos_used BEFORE calling Gemini (prevent race conditions)
      const { error: rpcError } = await supabaseAdmin.rpc('increment_photos_used', { uid: authUser.id })
      if (rpcError) {
        await supabaseAdmin.from('users').update({
          photos_used: (userData.photos_used ?? 0) + 1,
        }).eq('id', authUser.id)
      }
    }

    // --- Original process logic ---
    const body = await req.json()
    const { image, imageBase64, imageUrl, mimeType, processType = 'professional', userRequest, style, extras, model: requestedModel } = body

    let imgData = image || imageBase64

    if (!imgData && imageUrl) {
      const imgRes = await fetch(imageUrl)
      if (!imgRes.ok) {
        console.error(`Failed to fetch image from URL: ${imageUrl} — status ${imgRes.status}`)
        return NextResponse.json({ error: `No se pudo cargar la imagen (${imgRes.status}). Vuelve a subir la foto.` }, { status: 400 })
      }
      const buf = await imgRes.arrayBuffer()
      if (buf.byteLength === 0) {
        return NextResponse.json({ error: 'La imagen está vacía. Vuelve a subir la foto.' }, { status: 400 })
      }
      const rawBuf = Buffer.from(buf)
      if (rawBuf.byteLength > 15 * 1024 * 1024) {
        return NextResponse.json({ error: 'La imagen supera los 15 MB. Reduce el tamaño antes de subir.' }, { status: 400 })
      }
      imgData = rawBuf.toString('base64')
    }

    if (!imgData) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Reject HEIC/HEIF — not supported by Gemini
    if (mimeType && (mimeType.includes('heic') || mimeType.includes('heif'))) {
      return NextResponse.json(
        { error: 'Formato HEIC no soportado. En iPhone ve a Ajustes > Cámara > Formatos y selecciona "Mayor compatibilidad" para guardar en JPEG.' },
        { status: 400 }
      )
    }

    // Normalize PNG to JPEG mime for Gemini compatibility
    const effectiveMimeType = (mimeType && mimeType.includes('png')) ? 'image/png' : (mimeType || 'image/jpeg')

    if (processType === 'renovation' && !userRequest) {
      return NextResponse.json(
        { error: 'userRequest is required for renovation mode' },
        { status: 400 }
      )
    }

    const prompt = getPrompt(processType as ProcessType, userRequest, style, extras)

    const MODELS = [
      requestedModel || 'gemini-3-pro-image-preview',
      'gemini-2.5-flash-image',
      'gemini-2.0-flash-preview-image-generation',
    ].filter((v, i, a) => a.indexOf(v) === i)

    let lastError = 'No image returned'

    console.log('PROCESS REQUEST:', { processType, style, extras: extras?.length, userRequest: userRequest?.slice(0,50) })
    for (const modelId of MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelId })
        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType: effectiveMimeType, data: imgData } }
            ]
          }],
          generationConfig: {
            responseModalities: ['IMAGE', 'TEXT'],
          } as any
        })

        const candidate = result.response.candidates?.[0]
        // IMAGE_RECITATION or empty content — try next model
        if (!candidate?.content?.parts?.length) {
          lastError = `Model ${modelId} returned no content`
          continue
        }

        for (const part of candidate.content.parts) {
          if ((part as any).inlineData) {
            return NextResponse.json({
              image: (part as any).inlineData.data,
              mimeType: (part as any).inlineData.mimeType,
            })
          }
        }

        lastError = `Model ${modelId} returned no image part`
      } catch (modelErr: any) {
        lastError = modelErr.message || `Model ${modelId} failed`
        continue
      }
    }

    return NextResponse.json({ error: lastError }, { status: 500 })
  } catch (error: any) {
    console.error('Process error:', error)
    console.error('FULL ERROR:', JSON.stringify(error, null, 2), error.stack)
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const maxDuration = 60

const MARBLE_BASE = 'https://api.worldlabs.ai'
const API_KEY = process.env.WORLD_LABS_API_KEY!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { propertyId, imageBase64, mimeType, imageUrl } = body

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId is required' }, { status: 400 })
    }

    if (!imageBase64 && !imageUrl) {
      return NextResponse.json({ error: 'imageBase64 or imageUrl is required' }, { status: 400 })
    }

    let mediaAssetName: string

    if (imageBase64) {
      // Step 1: Prepare upload
      const prepareRes = await fetch(`${MARBLE_BASE}/marble/v1/media-assets:prepare_upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'WLT-Api-Key': API_KEY,
        },
        body: JSON.stringify({
          mime_type: mimeType || 'image/jpeg',
        }),
      })

      if (!prepareRes.ok) {
        const err = await prepareRes.text()
        console.error('Marble prepare_upload error:', err)
        return NextResponse.json({ error: 'Failed to prepare upload' }, { status: 500 })
      }

      const prepareData = await prepareRes.json()
      const { signed_url, media_asset } = prepareData

      // Step 2: Upload image to signed URL
      const imageBuffer = Buffer.from(imageBase64, 'base64')
      const uploadRes = await fetch(signed_url, {
        method: 'PUT',
        headers: { 'Content-Type': mimeType || 'image/jpeg' },
        body: imageBuffer,
      })

      if (!uploadRes.ok) {
        console.error('Marble upload error:', await uploadRes.text())
        return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
      }

      mediaAssetName = media_asset.name
    } else {
      // Use imageUrl directly — prepare upload from URL
      const prepareRes = await fetch(`${MARBLE_BASE}/marble/v1/media-assets:prepare_upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'WLT-Api-Key': API_KEY,
        },
        body: JSON.stringify({
          source_url: imageUrl,
        }),
      })

      if (!prepareRes.ok) {
        const err = await prepareRes.text()
        console.error('Marble prepare_upload error:', err)
        return NextResponse.json({ error: 'Failed to prepare upload from URL' }, { status: 500 })
      }

      const prepareData = await prepareRes.json()
      mediaAssetName = prepareData.media_asset.name
    }

    // Step 3: Generate world
    const generateRes = await fetch(`${MARBLE_BASE}/marble/v1/worlds:generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'WLT-Api-Key': API_KEY,
      },
      body: JSON.stringify({
        image: { media_asset: mediaAssetName },
      }),
    })

    if (!generateRes.ok) {
      const err = await generateRes.text()
      console.error('Marble generate error:', err)
      return NextResponse.json({ error: 'Failed to generate world' }, { status: 500 })
    }

    const generateData = await generateRes.json()
    const operationId = generateData.name // operations/{id}

    // Step 4: Save to Supabase
    const { error: dbError } = await supabase.from('marble_worlds').insert({
      project_id: propertyId,
      operation_id: operationId,
      status: 'processing',
    })

    if (dbError) {
      console.error('Supabase insert error:', dbError)
      return NextResponse.json({ error: 'Failed to save to database' }, { status: 500 })
    }

    return NextResponse.json({ operationId })
  } catch (error: any) {
    console.error('Marble generate error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate 3D tour' },
      { status: 500 }
    )
  }
}

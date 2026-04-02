import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const MARBLE_BASE = 'https://api.worldlabs.ai'
const API_KEY = process.env.WORLD_LABS_API_KEY!

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  _req: NextRequest,
  { params }: { params: { operationId: string } }
) {
  try {
    const operationId = params.operationId

    const res = await fetch(`${MARBLE_BASE}/marble/v1/operations/${operationId}`, {
      headers: { 'WLT-Api-Key': API_KEY },
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Marble status error:', err)
      return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
    }

    const data = await res.json()

    if (data.done) {
      const worldId = data.response?.world_id || data.response?.name?.split('/').pop()
      const assets = data.response?.assets || null

      // Update Supabase
      await supabase
        .from('marble_worlds')
        .update({
          status: 'completed',
          world_id: worldId,
          assets,
          updated_at: new Date().toISOString(),
        })
        .eq('operation_id', `operations/${operationId}`)

      return NextResponse.json({ done: true, worldId, assets })
    }

    // Check for error
    if (data.error) {
      await supabase
        .from('marble_worlds')
        .update({
          status: 'failed',
          updated_at: new Date().toISOString(),
        })
        .eq('operation_id', `operations/${operationId}`)

      return NextResponse.json({ done: true, error: data.error })
    }

    return NextResponse.json({ done: false })
  } catch (error: any) {
    console.error('Marble status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check status' },
      { status: 500 }
    )
  }
}

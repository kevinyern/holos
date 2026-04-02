import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { user_id, email } = await req.json()
    if (!user_id || !email) {
      return NextResponse.json({ error: 'Missing user_id or email' }, { status: 400 })
    }

    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'

    if (ip !== 'unknown') {
      // Check how many accounts this IP created in the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { count, error: countError } = await supabase
        .from('ip_signups')
        .select('*', { count: 'exact', head: true })
        .eq('ip_address', ip)
        .gte('created_at', sevenDaysAgo)

      if (countError) {
        console.error('Error checking IP signups:', countError)
        // Don't block signup on DB errors — just log and continue
      } else if (count !== null && count >= 2) {
        return NextResponse.json(
          { error: 'Demasiadas cuentas creadas desde esta red. Inténtalo más tarde.' },
          { status: 429 }
        )
      }

      // Only record if this is a real signup (not a precheck)
      if (user_id !== 'precheck') {
        const { error: insertError } = await supabase
          .from('ip_signups')
          .insert({ ip_address: ip, user_id })

        if (insertError) {
          console.error('Error recording IP signup:', insertError)
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Auth route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

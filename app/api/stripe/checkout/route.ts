import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const { priceId } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: 'priceId required' }, { status: 400 })
    }

    // Get userId from Supabase session server-side
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || ''

    if (!userId) {
      return NextResponse.json({ redirect: '/auth?next=/pricing' }, { status: 200 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://www.photoagent.pro/dashboard?success=true',
      cancel_url: 'https://www.photoagent.pro/pricing',
      metadata: { userId },
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe checkout error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

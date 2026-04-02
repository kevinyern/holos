import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PLAN_MAP: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
  [process.env.STRIPE_PRICE_PRO || '']: 'pro',
  [process.env.STRIPE_PRICE_AGENCY || '']: 'agency',
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)
    const priceId = lineItems.data[0]?.price?.id || ''
    const plan = PLAN_MAP[priceId] || 'starter'

    if (userId) {
      await supabase.from('users').update({
        plan,
        photos_used: 0,
        quota_reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        payment_failed: false,
      }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription
    const customerId = subscription.customer as string

    // Look up user by Stripe customer ID from the checkout session metadata
    // Since we store userId in metadata, we need to find sessions for this customer
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 1,
    })
    const userId = sessions.data[0]?.metadata?.userId

    if (userId) {
      await supabase.from('users').update({
        plan: 'free',
        photos_used: 0,
        payment_failed: false,
      }).eq('id', userId)
    }
  }

  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as Stripe.Invoice
    const customerId = invoice.customer as string

    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,
      limit: 1,
    })
    const userId = sessions.data[0]?.metadata?.userId

    if (userId) {
      await supabase.from('users').update({
        payment_failed: true,
      }).eq('id', userId)
    }
  }

  return NextResponse.json({ received: true })
}

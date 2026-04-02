import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET() {
  try {
    const key = process.env.STRIPE_SECRET_KEY || 'NOT SET'
    const stripe = new Stripe(key)
    const products = await stripe.products.list({ limit: 1 })
    return NextResponse.json({ 
      keyPrefix: key.substring(0, 20),
      works: true,
      products: products.data.length
    })
  } catch(e: any) {
    return NextResponse.json({ error: e.message, keyPrefix: (process.env.STRIPE_SECRET_KEY || '').substring(0, 20) })
  }
}

# Deploy Checklist — Vercel Environment Variables

Add all of these in **Vercel Dashboard > Settings > Environment Variables**.

## Required Environment Variables

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Settings > API | Already in .env.local |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API | Already in .env.local |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API | **Secret** — never expose client-side |
| `GEMINI_API_KEY` | Google AI Studio | Already in .env.local |
| `FAL_KEY` | fal.ai dashboard | Already in .env.local |
| `WORLD_LABS_API_KEY` | World Labs | Already in .env.local |
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API keys | Already in .env.local |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > Developers > API keys | Already in .env.local |
| `STRIPE_PRICE_STARTER` | Stripe Dashboard > Products > Starter price ID | Already in .env.local |
| `STRIPE_PRICE_PRO` | Stripe Dashboard > Products > Pro price ID | Already in .env.local |
| `STRIPE_PRICE_AGENCY` | Stripe Dashboard > Products > Agency price ID | Already in .env.local |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Developers > Webhooks > your endpoint > Signing secret | **NEW — must add** |

## Webhook Setup

1. Go to **Stripe Dashboard > Developers > Webhooks**
2. Add endpoint: `https://www.photoagent.pro/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
4. Copy the **Signing secret** (`whsec_...`) and set it as `STRIPE_WEBHOOK_SECRET` in Vercel

## Database Migration

Run the migration on your Supabase database:

```sql
-- File: supabase/migrations/001_fix_plan_quota.sql
```

Or execute it directly in Supabase SQL Editor.

-- Fix plan constraint: add starter and agency, remove enterprise
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_plan_check;
ALTER TABLE public.users ADD CONSTRAINT users_plan_check CHECK (plan IN ('free', 'starter', 'pro', 'agency'));

-- Add quota tracking columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS photos_used integer NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS quota_reset_at timestamptz NOT NULL DEFAULT (now() + interval '1 month');

-- Add payment_failed flag
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS payment_failed boolean NOT NULL DEFAULT false;

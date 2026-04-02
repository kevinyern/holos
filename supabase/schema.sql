-- Holos database schema

-- Users table (extends Supabase auth.users)
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'agency')),
  photos_used integer not null default 0,
  quota_reset_at timestamptz not null default (now() + interval '1 month'),
  payment_failed boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can read own data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update own data"
  on public.users for update
  using (auth.uid() = id);

-- Projects table
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived', 'processing')),
  created_at timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can manage own projects"
  on public.projects for all
  using (auth.uid() = user_id);

-- Photos table
create table if not exists public.photos (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  original_url text,
  processed_url text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

create policy "Users can manage photos in own projects"
  on public.photos for all
  using (
    project_id in (
      select id from public.projects where user_id = auth.uid()
    )
  );

-- Auto-create user row on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- IP signup tracking (anti-duplicate protection)
create table if not exists public.ip_signups (
  id uuid default gen_random_uuid() primary key,
  ip_address text not null,
  user_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_ip_signups_ip_created
  on public.ip_signups (ip_address, created_at desc);

alter table public.ip_signups enable row level security;

-- Only service role can insert/read (via API route)
create policy "Service role only"
  on public.ip_signups for all
  using (false)
  with check (false);

-- Indexes for common queries
create index if not exists idx_projects_user_id on public.projects (user_id);
create index if not exists idx_photos_project_id on public.photos (project_id);
create index if not exists idx_photos_status on public.photos (status);

-- Marble 3D Worlds table
create table if not exists public.marble_worlds (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  operation_id text not null,
  world_id text,
  status text not null default 'processing' check (status in ('processing', 'completed', 'failed')),
  assets jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marble_worlds enable row level security;

create policy "Users can manage marble worlds in own projects"
  on public.marble_worlds for all
  using (project_id in (select id from public.projects where user_id = auth.uid()));

create index if not exists idx_marble_worlds_project_id on public.marble_worlds (project_id);

-- Increment photos_used atomically
create or replace function public.increment_photos_used(uid uuid)
returns void as $$
begin
  update public.users set photos_used = photos_used + 1 where id = uid;
end;
$$ language plpgsql security definer;

-- Usage logs table
create table if not exists public.usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  action text not null, -- "enhance", "relight", "staging", "marble"
  cost_cents int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.usage_logs enable row level security;

create policy "Users can read own usage"
  on public.usage_logs for select
  using (auth.uid() = user_id);

create policy "Service can insert usage"
  on public.usage_logs for insert
  with check (true);

create index if not exists idx_usage_logs_user_id on public.usage_logs (user_id, created_at desc);

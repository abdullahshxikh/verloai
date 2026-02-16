-- 1. Create the profiles table (Updated with new columns)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  streak integer default 0,
  xp integer default 0,
  charisma_score integer default 0,
  completed_levels jsonb default '[]'::jsonb,
  last_practice_date text,
  -- NEW COLUMNS
  avatar_url text,
  full_name text
);

-- 2. Add columns if table already exists (Idempotent)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'avatar_url') then
    alter table public.profiles add column avatar_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'full_name') then
    alter table public.profiles add column full_name text;
  end if;
end $$;

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 4. Create Policies (Idempotent: Drop first to ensure update)
drop policy if exists "Users can view own profile" on profiles;
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

drop policy if exists "Users can insert own profile" on profiles;
create policy "Users can insert own profile"
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile" on profiles;
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- 5. Enable realtime (Robust check)
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table profiles;
  end if;
end $$;

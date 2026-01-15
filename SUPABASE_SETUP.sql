-- Run this in your Supabase SQL Editor

-- 1. Create the profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  streak integer default 0,
  xp integer default 0,
  charisma_score integer default 0,
  completed_levels jsonb default '[]'::jsonb,
  last_practice_date text
);

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Create Policies
-- Allow users to view their own profile
create policy "Users can view own profile"
  on profiles for select
  using ( auth.uid() = id );

-- Allow users to insert their own profile
create policy "Users can insert own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- Allow users to update their own profile
create policy "Users can update own profile"
  on profiles for update
  using ( auth.uid() = id );

-- 4. Enable realtime for this table (optional)
alter publication supabase_realtime add table profiles;

-- Supabase Schema for Language Teacher App
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  native_language text default 'English',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User preferences table
create table if not exists public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  target_languages text[] default '{}',
  proficiency_levels jsonb default '{"japanese": "A1", "korean": "A1", "mandarin": "A1"}',
  voice_enabled boolean default true,
  auto_play_responses boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Learning progress table (one row per user per language)
create table if not exists public.learning_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  language text not null check (language in ('japanese', 'korean', 'mandarin')),
  vocabulary_mastered text[] default '{}',
  grammar_points_covered text[] default '{}',
  conversation_minutes integer default 0,
  exercises_completed integer default 0,
  current_streak integer default 0,
  last_practice_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, language)
);

-- Conversation history table
create table if not exists public.conversation_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  language text not null check (language in ('japanese', 'korean', 'mandarin')),
  messages jsonb default '[]',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.learning_progress enable row level security;
alter table public.conversation_history enable row level security;

-- Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Policies for user_preferences
create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

-- Policies for learning_progress
create policy "Users can view own progress"
  on public.learning_progress for select
  using (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.learning_progress for update
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.learning_progress for insert
  with check (auth.uid() = user_id);

-- Policies for conversation_history
create policy "Users can view own conversations"
  on public.conversation_history for select
  using (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversation_history for update
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.conversation_history for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversation_history for delete
  using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for better query performance
create index if not exists idx_user_preferences_user_id on public.user_preferences(user_id);
create index if not exists idx_learning_progress_user_id on public.learning_progress(user_id);
create index if not exists idx_learning_progress_language on public.learning_progress(language);
create index if not exists idx_conversation_history_user_id on public.conversation_history(user_id);

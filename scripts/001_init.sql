-- Zero AI Database Schema
-- Run this migration in your Supabase SQL Editor

-- Enable pgvector extension for embeddings
create extension if not exists vector;

-- Users extended profile
create table if not exists public.profiles (
  id uuid references auth.users primary key,
  name text,
  email text,
  plan text default 'free' check (plan in ('free','pro','ultra')),
  plan_expires_at timestamptz,
  messages_today int default 0,
  messages_reset_at timestamptz default now(),
  location_country text,
  location_currency text default 'INR',
  razorpay_subscription_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

-- Conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  model text default 'auto',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text check (role in ('user','assistant','system')),
  content text,
  model_used text,
  tokens_used int,
  has_image boolean default false,
  image_url text,
  created_at timestamptz default now()
);

-- Memory layer (THE VIRAL FEATURE)
create table if not exists public.user_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  fact text not null,
  category text check (category in ('preference','project','skill','personal','goal')),
  confidence float default 1.0,
  source_conversation_id uuid references conversations(id),
  embedding vector(768),
  created_at timestamptz default now(),
  last_reinforced_at timestamptz default now()
);

-- Create index for vector similarity search
create index if not exists user_memories_embedding_idx 
  on user_memories 
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Create vector similarity search function
create or replace function match_memories(
  query_embedding vector(768),
  match_user_id uuid,
  match_count int default 20
)
returns table (id uuid, fact text, category text, similarity float)
language sql stable as $$
  select id, fact, category,
    1 - (embedding <=> query_embedding) as similarity
  from user_memories
  where user_id = match_user_id
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Votes for Zero vs X feature
create table if not exists public.model_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  prompt_hash text,
  winner_model text,
  created_at timestamptz default now()
);

-- Function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to reset daily message counts
create or replace function reset_daily_messages()
returns void as $$
begin
  update profiles
  set messages_today = 0, messages_reset_at = now()
  where messages_reset_at < now() - interval '24 hours';
end;
$$ language plpgsql;

-- RLS policies
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table user_memories enable row level security;
alter table model_votes enable row level security;

-- Profiles: users can only access their own data
create policy "Users own their profile"
  on profiles for all
  using (auth.uid() = id);

-- Conversations: users can only access their own conversations
create policy "Users own their conversations"
  on conversations for all
  using (auth.uid() = user_id);

-- Messages: users can only access messages in their conversations
create policy "Users own their messages"
  on messages for all
  using (
    auth.uid() = (
      select user_id from conversations where id = conversation_id
    )
  );

-- Memories: users can only access their own memories
create policy "Users own their memories"
  on user_memories for all
  using (auth.uid() = user_id);

-- Votes: users can only access their own votes
create policy "Users own their votes"
  on model_votes for all
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists conversations_user_id_idx on conversations(user_id);
create index if not exists conversations_updated_at_idx on conversations(updated_at desc);
create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists messages_created_at_idx on messages(created_at);
create index if not exists user_memories_user_id_idx on user_memories(user_id);
create index if not exists user_memories_category_idx on user_memories(category);

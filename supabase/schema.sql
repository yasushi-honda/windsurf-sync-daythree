-- Create tweets table
create table tweets (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  content text not null,
  user_id uuid not null,
  likes integer default 0
);

-- Create profiles table
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table tweets enable row level security;
alter table profiles enable row level security;

-- Create policies
create policy "Public tweets are viewable by everyone."
  on tweets for select
  using ( true );

create policy "Users can insert their own tweets."
  on tweets for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own tweets."
  on tweets for update
  using ( auth.uid() = user_id );

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

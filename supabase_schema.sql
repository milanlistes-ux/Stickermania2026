-- Run this in your Supabase SQL editor to set up the database

create table if not exists users (
  id uuid primary key,
  display_name text,
  created_at timestamptz default now()
);

create table if not exists stickers (
  user_id uuid references users(id) on delete cascade,
  code text not null,
  status smallint not null check (status in (1, 2)),
  updated_at timestamptz default now(),
  primary key (user_id, code)
);

-- Allow anyone to read/write (users are identified by UUID, no auth needed)
alter table users enable row level security;
alter table stickers enable row level security;

create policy "Users are publicly readable" on users for select using (true);
create policy "Users can upsert own row" on users for insert with check (true);
create policy "Users can update own row" on users for update using (true);

create policy "Stickers are publicly readable" on stickers for select using (true);
create policy "Stickers can be inserted" on stickers for insert with check (true);
create policy "Stickers can be updated" on stickers for update using (true);
create policy "Stickers can be deleted" on stickers for delete using (true);

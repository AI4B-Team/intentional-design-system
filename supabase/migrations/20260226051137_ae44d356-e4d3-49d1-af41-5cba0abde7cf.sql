
create table if not exists public.aiva_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null default 'New Conversation',
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.aiva_conversations enable row level security;

create policy "Users can manage their own conversations"
  on public.aiva_conversations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index aiva_conversations_user_id_idx on public.aiva_conversations(user_id);
create index aiva_conversations_updated_at_idx on public.aiva_conversations(updated_at desc);

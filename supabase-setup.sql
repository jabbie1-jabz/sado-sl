-- Run once in the SADO-SL Supabase project's SQL editor.
create table public.marketplace_items (
  id text primary key,
  kind text not null check (kind in ('product', 'video')),
  payload jsonb not null,
  media_path text,
  created_at timestamptz not null default now()
);

alter table public.marketplace_items enable row level security;
grant select on public.marketplace_items to anon, authenticated;
grant insert, update, delete on public.marketplace_items to authenticated;

create policy "Public can read listings" on public.marketplace_items
  for select to anon, authenticated using (true);
create policy "Only the SADO admin can publish" on public.marketplace_items
  for all to authenticated
  using (auth.uid() = '6e0b0b82-8c5a-4ea8-bf35-5be8792fd26e'::uuid)
  with check (auth.uid() = '6e0b0b82-8c5a-4ea8-bf35-5be8792fd26e'::uuid);

insert into storage.buckets (id, name, public, file_size_limit)
values ('marketplace', 'marketplace', true, 52428800);

create policy "Public can read marketplace media" on storage.objects
  for select to anon, authenticated using (bucket_id = 'marketplace');
create policy "SADO admin can upload marketplace media" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'marketplace' and auth.uid() = '6e0b0b82-8c5a-4ea8-bf35-5be8792fd26e'::uuid);
create policy "SADO admin can update marketplace media" on storage.objects
  for update to authenticated
  using (bucket_id = 'marketplace' and auth.uid() = '6e0b0b82-8c5a-4ea8-bf35-5be8792fd26e'::uuid)
  with check (bucket_id = 'marketplace' and auth.uid() = '6e0b0b82-8c5a-4ea8-bf35-5be8792fd26e'::uuid);
create policy "SADO admin can delete marketplace media" on storage.objects
  for delete to authenticated
  using (bucket_id = 'marketplace' and auth.uid() = '6e0b0b82-8c5a-4ea8-bf35-5be8792fd26e'::uuid);

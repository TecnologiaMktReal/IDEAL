-- Supabase bootstrap for IDEAL system
-- Execute after schema.sql in Supabase SQL Editor.

-- 1) Storage buckets
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'transcripts-private',
    'transcripts-private',
    false,
    52428800,
    array['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  ),
  (
    'reports-private',
    'reports-private',
    false,
    104857600,
    array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  ),
  (
    'reports-client',
    'reports-client',
    false,
    104857600,
    array['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  ),
  (
    'brand-assets',
    'brand-assets',
    true,
    10485760,
    array['image/png', 'image/svg+xml', 'image/x-icon', 'application/pdf', 'font/woff2']
  )
on conflict (id) do nothing;

-- 2) Helpers for RLS
create or replace function public.current_app_user_id()
returns uuid
language sql
stable
as $$
  select u.id
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.current_org_id()
returns uuid
language sql
stable
as $$
  select u.organization_id
  from public.users u
  where u.auth_user_id = auth.uid()
  limit 1
$$;

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.user_id = public.current_app_user_id()
  )
$$;

-- 3) Enable RLS in key tables
alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.document_publications enable row level security;
alter table public.document_exports enable row level security;
alter table public.approvals enable row level security;
alter table public.notifications enable row level security;

-- 4) Core policies
drop policy if exists org_read_same_org on public.organizations;
create policy org_read_same_org
on public.organizations
for select
using (id = public.current_org_id());

drop policy if exists users_read_same_org on public.users;
create policy users_read_same_org
on public.users
for select
using (organization_id = public.current_org_id());

drop policy if exists projects_read_by_member on public.projects;
create policy projects_read_by_member
on public.projects
for select
using (public.is_project_member(id));

drop policy if exists project_members_read_by_member on public.project_members;
create policy project_members_read_by_member
on public.project_members
for select
using (public.is_project_member(project_id));

drop policy if exists publications_read_by_member on public.document_publications;
create policy publications_read_by_member
on public.document_publications
for select
using (public.is_project_member(project_id));

drop policy if exists exports_read_by_member on public.document_exports;
create policy exports_read_by_member
on public.document_exports
for select
using (public.is_project_member(project_id));

drop policy if exists approvals_read_by_member on public.approvals;
create policy approvals_read_by_member
on public.approvals
for select
using (public.is_project_member(project_id) or requested_to_user_id = public.current_app_user_id());

drop policy if exists notifications_read_by_recipient on public.notifications;
create policy notifications_read_by_recipient
on public.notifications
for select
using (recipient_user_id = public.current_app_user_id());

-- 5) Storage policies
drop policy if exists transcripts_private_rw on storage.objects;
create policy transcripts_private_rw
on storage.objects
for all
to authenticated
using (bucket_id = 'transcripts-private')
with check (bucket_id = 'transcripts-private');

drop policy if exists reports_private_rw on storage.objects;
create policy reports_private_rw
on storage.objects
for all
to authenticated
using (bucket_id = 'reports-private')
with check (bucket_id = 'reports-private');

drop policy if exists reports_client_read on storage.objects;
create policy reports_client_read
on storage.objects
for select
to authenticated
using (bucket_id = 'reports-client');

drop policy if exists reports_client_upload on storage.objects;
create policy reports_client_upload
on storage.objects
for insert
to authenticated
with check (bucket_id = 'reports-client');

drop policy if exists brand_assets_public_read on storage.objects;
create policy brand_assets_public_read
on storage.objects
for select
to public
using (bucket_id = 'brand-assets');

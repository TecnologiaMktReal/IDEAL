-- Hotfix idempotente para ambiente Supabase remoto
-- Objetivo: garantir tabelas de auditoria/historico e recarregar schema do PostgREST.

create table if not exists stage_state_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage stage_code not null,
  from_status stage_status,
  to_status stage_status not null,
  actor_user_id uuid not null references users(id),
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id),
  project_id uuid references projects(id) on delete cascade,
  action_code text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Forca recarregamento do schema cache do PostgREST.
notify pgrst, 'reload schema';

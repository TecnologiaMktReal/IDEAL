-- Core extensions
create extension if not exists "pgcrypto";

-- Enums
create type role_code as enum ('consultor', 'cliente', 'gestor');
create type stage_code as enum ('I', 'D', 'E', 'A', 'L');
create type stage_status as enum ('not_started', 'in_progress', 'ready_for_completion', 'completed', 'reopened');
create type approval_type as enum ('type1_science', 'type2_decision');
create type approval_status as enum ('pending', 'registered', 'expired');
create type ai_confidence as enum ('high', 'medium', 'low');
create type ai_state as enum ('suggested', 'approved', 'edited', 'rejected');
create type export_format as enum ('pdf', 'docx');

-- Identity and access
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  organization_id uuid not null references organizations(id),
  full_name text not null,
  email text not null unique,
  role role_code not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Project core
create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id),
  consultant_owner_id uuid not null references users(id),
  client_company_name text not null,
  cnpj text not null,
  segment text,
  started_at date,
  expected_end_at date,
  created_at timestamptz not null default now()
);

create table project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references users(id),
  role role_code not null,
  unique (project_id, user_id)
);

create table project_stage_state (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage stage_code not null,
  status stage_status not null default 'not_started',
  automatic_checklist_ok boolean not null default false,
  manual_confirmation_ok boolean not null default false,
  required_client_decision_ok boolean not null default false,
  completed_at timestamptz,
  unique (project_id, stage)
);

create table stage_state_history (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage stage_code not null,
  from_status stage_status,
  to_status stage_status not null,
  actor_user_id uuid not null references users(id),
  reason text,
  created_at timestamptz not null default now()
);

-- Document model
create table documents (
  id uuid primary key default gen_random_uuid(),
  doc_code text not null unique,
  name text not null,
  stage stage_code not null,
  kind text not null,
  visibility text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  version_label text not null,
  schema_json jsonb not null,
  published_at timestamptz,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now(),
  unique (document_id, version_label)
);

create table document_publications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  document_version_id uuid not null references document_versions(id),
  published_by uuid not null references users(id),
  published_to_client boolean not null default false,
  created_at timestamptz not null default now()
);

create table document_exports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  document_version_id uuid not null references document_versions(id),
  format export_format not null,
  storage_key text not null,
  exported_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

-- Interview and AI
create table stakeholders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  name text not null,
  position text,
  area text,
  created_at timestamptz not null default now()
);

create table interviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stakeholder_id uuid not null references stakeholders(id),
  interview_date timestamptz not null,
  interviewer_id uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table transcripts (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid not null references interviews(id) on delete cascade,
  storage_key text not null,
  uploaded_by uuid not null references users(id),
  uploaded_at timestamptz not null default now()
);

create table ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage stage_code not null,
  domain text not null,
  confidence ai_confidence not null,
  state ai_state not null default 'suggested',
  suggested_value text not null,
  evidence_json jsonb not null,
  created_at timestamptz not null default now()
);

create table ai_validations (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references ai_suggestions(id) on delete cascade,
  validator_user_id uuid not null references users(id),
  action ai_state not null,
  final_value text,
  created_at timestamptz not null default now()
);

-- Diagnosis and planning
create table diagnostic_scores_c1 (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  block_code text not null,
  score numeric(5,2) not null,
  classification text not null,
  created_at timestamptz not null default now()
);

create table diagnostic_scores_c2 (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  axis_code text not null,
  block_code text not null,
  score numeric(5,2) not null,
  classification text not null,
  created_at timestamptz not null default now()
);

create table cross_matrix_results (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  x_classification text not null,
  y_classification text not null,
  scenario_label text not null,
  generated_at timestamptz not null default now()
);

create table scenario_decisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  dimension_code text not null,
  selected_scenario text not null,
  decided_by uuid not null references users(id),
  decided_at timestamptz not null default now()
);

create table architecture_actions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  phase_code text not null,
  title text not null,
  responsible_user_id uuid references users(id),
  due_date date,
  dependency_action_id uuid references architecture_actions(id),
  source_reference text,
  created_at timestamptz not null default now()
);

create table kpis (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  level text not null,
  code text not null,
  name text not null,
  baseline numeric(12,4),
  target numeric(12,4),
  current_value numeric(12,4),
  updated_at timestamptz not null default now()
);

-- Methodology execution engine
create table project_stage_artifacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage stage_code not null,
  artifact_code text not null,
  artifact_name text not null,
  status text not null default 'draft',
  completion_ratio numeric(5,2) not null default 0,
  computed_json jsonb not null default '{}'::jsonb,
  validated_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, stage, artifact_code)
);

create table project_artifact_sections (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references project_stage_artifacts(id) on delete cascade,
  section_code text not null,
  section_title text not null,
  status text not null default 'pending',
  completion_ratio numeric(5,2) not null default 0,
  updated_at timestamptz not null default now(),
  unique (artifact_id, section_code)
);

create table project_artifact_answers (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references project_stage_artifacts(id) on delete cascade,
  section_code text not null,
  field_code text not null,
  value_json jsonb not null default 'null'::jsonb,
  is_valid boolean,
  validation_message text,
  updated_by uuid references users(id),
  updated_at timestamptz not null default now(),
  unique (artifact_id, section_code, field_code)
);

create table project_artifact_snapshots (
  id uuid primary key default gen_random_uuid(),
  artifact_id uuid not null references project_stage_artifacts(id) on delete cascade,
  snapshot_label text not null,
  snapshot_json jsonb not null,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

-- Loop
create table loop_rituals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  ritual_code text not null,
  frequency text not null,
  next_occurrence timestamptz,
  created_at timestamptz not null default now()
);

create table loop_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  review_type text not null,
  review_date timestamptz not null,
  summary text,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

create table rediagnostic_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  run_label text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table learning_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  milestone_date timestamptz not null,
  lesson_summary text not null,
  created_by uuid not null references users(id),
  created_at timestamptz not null default now()
);

-- Approvals, comments, notifications and audit
create table approvals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage stage_code not null,
  type approval_type not null,
  status approval_status not null default 'pending',
  requested_to_user_id uuid not null references users(id),
  requested_by_user_id uuid not null references users(id),
  decision_payload jsonb,
  decided_at timestamptz
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  publication_id uuid references document_publications(id),
  author_user_id uuid not null references users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  recipient_user_id uuid not null references users(id),
  event_code text not null,
  channel text not null,
  priority text not null,
  payload jsonb not null default '{}'::jsonb,
  sent_at timestamptz
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id),
  project_id uuid references projects(id) on delete cascade,
  action_code text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

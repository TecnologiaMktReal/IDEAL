-- Supabase seed inicial para Sistema IDEAL
-- Execute apos:
-- 1) schema.sql
-- 2) supabase-bootstrap.sql

-- -----------------------------------------------------------------------------
-- 1) Organizacao base
-- -----------------------------------------------------------------------------
insert into public.organizations (name)
select 'MKT Real'
where not exists (
  select 1 from public.organizations where name = 'MKT Real'
);

-- -----------------------------------------------------------------------------
-- 2) Usuarios base (gestor, consultor, cliente)
-- -----------------------------------------------------------------------------
with org as (
  select id from public.organizations where name = 'MKT Real' limit 1
)
insert into public.users (organization_id, full_name, email, role, is_active)
select org.id, u.full_name, u.email, u.role::role_code, true
from org
cross join (
  values
    ('Gestor MKT Real', 'tecnologia@mktreal.com.br', 'gestor'),
    ('Consultor IDEAL', 'consultor@mktreal.com.br', 'consultor'),
    ('Cliente Exemplo', 'cliente@empresa.com.br', 'cliente')
) as u(full_name, email, role)
where not exists (
  select 1 from public.users existing where existing.email = u.email
);

-- -----------------------------------------------------------------------------
-- 3) Vinculo com auth.users (Supabase Auth)
--    Rodar depois de criar os usuarios no painel Auth (email/senha).
-- -----------------------------------------------------------------------------
update public.users pu
set auth_user_id = au.id
from auth.users au
where pu.email = au.email
  and pu.auth_user_id is distinct from au.id;

-- -----------------------------------------------------------------------------
-- 4) Projeto base
-- -----------------------------------------------------------------------------
with org as (
  select id from public.organizations where name = 'MKT Real' limit 1
),
consultant as (
  select id
  from public.users
  where email = 'consultor@mktreal.com.br'
  limit 1
)
insert into public.projects (
  organization_id,
  consultant_owner_id,
  client_company_name,
  cnpj,
  segment,
  started_at,
  expected_end_at
)
select
  org.id,
  consultant.id,
  'Empresa Cliente Exemplo',
  '00.000.000/0001-00',
  'B2B Tecnico',
  current_date,
  current_date + interval '120 day'
from org
cross join consultant
where not exists (
  select 1
  from public.projects p
  where p.cnpj = '00.000.000/0001-00'
);

-- -----------------------------------------------------------------------------
-- 5) Membros do projeto (gestor, consultor e cliente)
-- -----------------------------------------------------------------------------
with project_base as (
  select id from public.projects where cnpj = '00.000.000/0001-00' limit 1
),
seed_members as (
  select id as user_id, role
  from public.users
  where email in (
    'tecnologia@mktreal.com.br',
    'consultor@mktreal.com.br',
    'cliente@empresa.com.br'
  )
)
insert into public.project_members (project_id, user_id, role)
select pb.id, sm.user_id, sm.role
from project_base pb
cross join seed_members sm
where not exists (
  select 1
  from public.project_members pm
  where pm.project_id = pb.id
    and pm.user_id = sm.user_id
);

-- -----------------------------------------------------------------------------
-- 6) Estado inicial das etapas (I -> D -> E -> A -> L)
-- -----------------------------------------------------------------------------
with project_base as (
  select id from public.projects where cnpj = '00.000.000/0001-00' limit 1
),
stages as (
  select 'I'::stage_code as stage, 'in_progress'::stage_status as status
  union all select 'D'::stage_code, 'not_started'::stage_status
  union all select 'E'::stage_code, 'not_started'::stage_status
  union all select 'A'::stage_code, 'not_started'::stage_status
  union all select 'L'::stage_code, 'not_started'::stage_status
)
insert into public.project_stage_state (
  project_id,
  stage,
  status,
  automatic_checklist_ok,
  manual_confirmation_ok,
  required_client_decision_ok
)
select
  pb.id,
  s.stage,
  s.status,
  false,
  false,
  false
from project_base pb
cross join stages s
where not exists (
  select 1
  from public.project_stage_state pss
  where pss.project_id = pb.id
    and pss.stage = s.stage
);

-- -----------------------------------------------------------------------------
-- 7) Validacoes rapidas
-- -----------------------------------------------------------------------------
-- select * from public.organizations;
-- select id, full_name, email, role, auth_user_id from public.users order by email;
-- select id, client_company_name, cnpj from public.projects;
-- select * from public.project_members;
-- select * from public.project_stage_state order by stage;

-- -----------------------------------------------------------------------------
-- 8) Catalogo base de documentos metodologicos (I-D-E-A-L)
-- -----------------------------------------------------------------------------
insert into public.documents (doc_code, name, stage, kind, visibility, is_active)
values
  ('DOC-01', 'MANUAL_METODOLOGICO_IMERSAO_v2', 'I', 'manual', 'internal', true),
  ('DOC-02', 'MATRIZ_DE_PERGUNTAS_IMERSAO', 'I', 'reference', 'internal', true),
  ('DOC-03', 'ROTEIROS_CONSOLIDADOS_IMERSAO', 'I', 'instrument', 'internal', true),
  ('DOC-04', 'GUIA_PERGUNTAS_POR_STAKEHOLDER', 'I', 'instrument', 'internal', true),
  ('DOC-05', 'TEMPLATE_PLANO_DE_IMERSAO', 'I', 'template', 'internal', true),
  ('DOC-06', 'TEMPLATE_DOSSIE_DE_IMERSAO', 'I', 'template', 'internal', true),
  ('DOC-07', 'TEMPLATE_RELATORIO_CLIENTE_IMERSAO', 'I', 'template', 'client', true),
  ('DOC-08', 'MANUAL_METODOLOGICO_DIAGNOSTICO', 'D', 'manual', 'internal', true),
  ('DOC-09', 'FORMULARIO_CONSOLIDADO_CAMADA1', 'D', 'form', 'internal', true),
  ('DOC-10', 'FORMULARIO_CONSOLIDADO_CAMADA2', 'D', 'form', 'internal', true),
  ('DOC-11', 'TEMPLATE_RELATORIO_CLIENTE_DIAGNOSTICO', 'D', 'template', 'client', true),
  ('DOC-12', 'MANUAL_METODOLOGICO_ESTRUTURA', 'E', 'manual', 'internal', true),
  ('DOC-13', 'FORMULARIO_ESTRUTURA', 'E', 'form', 'internal', true),
  ('DOC-14', 'TEMPLATE_RELATORIO_CLIENTE_ESTRUTURA', 'E', 'template', 'client', true),
  ('DOC-15', 'MANUAL_METODOLOGICO_ARQUITETURA', 'A', 'manual', 'internal', true),
  ('DOC-16', 'FORMULARIO_ARQUITETURA', 'A', 'form', 'internal', true),
  ('DOC-17', 'TEMPLATE_RELATORIO_CLIENTE_ARQUITETURA', 'A', 'template', 'client', true),
  ('DOC-18', 'MANUAL_METODOLOGICO_LOOP', 'L', 'manual', 'internal', true),
  ('DOC-19', 'FORMULARIO_LOOP', 'L', 'form', 'internal', true),
  ('DOC-20', 'TEMPLATE_RELATORIO_CLIENTE_LOOP', 'L', 'template', 'client', true)
on conflict (doc_code) do update
set
  name = excluded.name,
  stage = excluded.stage,
  kind = excluded.kind,
  visibility = excluded.visibility,
  is_active = excluded.is_active;

# Sistema IDEAL - MKT Real

Monorepo modular para implementacao do sistema de gestao da metodologia IDEAL.

## Estrutura

- `apps/web`: frontend React/Next para Consultor, Cliente e Gestor
- `apps/api`: API Node modular (BFF + dominios M1..M10)
- `packages/domain`: tipos de dominio e contratos compartilhados
- `packages/workflows`: maquina de estados e regras de governanca
- `packages/ai`: contratos de IA assistiva e rastreabilidade
- `packages/reports`: contratos de exportacao e templates
- `packages/ui`: design system Liquid Glass
- `docs/architecture`: artefatos arquiteturais detalhados
- `docs/catalog`: catalogo de documentos metodologicos

## Proximos passos

1. Instalar dependencias: `pnpm install`
2. Subir frontend: `pnpm dev:web`
3. Subir API: `pnpm dev:api`
4. Testar Supabase API: `GET /supabase/health`

## Docker (sistema completo)

1. Build e subida:
   - `docker compose up -d --build`
2. Ver logs:
   - `docker compose logs -f api`
   - `docker compose logs -f web`
3. Endpoints:
   - Web: `http://localhost:3100`
   - API: `http://localhost:3333/health`
   - Supabase health: `http://localhost:3333/supabase/health`
4. Parar containers:
   - `docker compose down`

## Supabase (SQL obrigatorio)

Execute no SQL Editor do Supabase, nesta ordem:

1. `apps/api/db/schema.sql`
2. `apps/api/db/supabase-bootstrap.sql`
3. `apps/api/db/supabase-seed.sql`

Se houver erro/ausencia de auditoria e historico de etapas, rode tambem:

4. `apps/api/db/supabase-hotfix-audit-methodology.sql`

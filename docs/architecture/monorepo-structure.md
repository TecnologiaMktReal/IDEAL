# Monorepo e contratos tecnicos

## Apps

- `apps/web` (Next.js 15 + React 19): interface unica para perfis Consultor, Cliente e Gestor.
- `apps/api` (Node + Fastify): API modular com rotas por dominio e orquestracao de workflows.

## Packages compartilhados

- `@ideal/domain`: tipos de negocio, enums e contratos base.
- `@ideal/workflows`: regras de conclusao de etapa, gates e maquina de estado.
- `@ideal/ai`: contratos de sugestoes, evidencias, validacao e rastreabilidade.
- `@ideal/reports`: contratos de exportacao PDF/DOCX e registro de templates.
- `@ideal/ui`: componentes React do design system Liquid Glass.
- `@ideal/config`: presets de lint, TS, testes e padroes.

## Contratos entre camadas

1. `apps/api` depende de `domain`, `workflows`, `ai`, `reports`.
2. `apps/web` depende de `domain` e `ui`.
3. `apps/web` consome contratos de API versionados (`/v1`) por OpenAPI.
4. `workflows` nao depende de frameworks web para manter regras puras.
5. `ai` e `reports` publicam interfaces para jobs assincros no backend.

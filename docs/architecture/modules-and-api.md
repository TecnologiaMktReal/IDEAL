# Modulos de negocio e APIs

## M1 - Gestao de Projetos

- Responsabilidade: onboarding, configuracao de projeto, timeline e progresso geral.
- Endpoints:
  - `POST /v1/projects`
  - `GET /v1/projects`
  - `GET /v1/projects/:projectId`
  - `PATCH /v1/projects/:projectId`

## M2 - Imersao

- Responsabilidade: plano de imersao, entrevistas, dossie e relatorio de imersao.
- Endpoints:
  - `POST /v1/projects/:projectId/immersion/plan`
  - `POST /v1/projects/:projectId/interviews`
  - `POST /v1/interviews/:interviewId/transcripts`
  - `POST /v1/projects/:projectId/immersion/report-draft`

## M3 - Diagnostico

- Responsabilidade: Camada 1, Camada 2, regras de bloqueio e Matriz Cruzada.
- Endpoints:
  - `POST /v1/projects/:projectId/diagnosis/c1/scores`
  - `POST /v1/projects/:projectId/diagnosis/c2/scores`
  - `POST /v1/projects/:projectId/diagnosis/cross-matrix/recalculate`
  - `GET /v1/projects/:projectId/diagnosis/summary`

## M4 - Estrutura

- Responsabilidade: gaps das 5 dimensoes, cenarios e priorizacao.
- Endpoints:
  - `POST /v1/projects/:projectId/structure/recommendations`
  - `POST /v1/projects/:projectId/structure/scenario-decisions`
  - `GET /v1/projects/:projectId/structure/dashboard`

## M5 - Arquitetura do Planejamento

- Responsabilidade: premissas, fases, KPIs, verba e modelo de execucao.
- Endpoints:
  - `POST /v1/projects/:projectId/planning/premises`
  - `POST /v1/projects/:projectId/planning/actions`
  - `POST /v1/projects/:projectId/planning/kpis`
  - `GET /v1/projects/:projectId/planning/roadmap`

## M6 - Loop

- Responsabilidade: rituais, reviews, rediagnosticos e evolucao.
- Endpoints:
  - `POST /v1/projects/:projectId/loop/rituals`
  - `POST /v1/projects/:projectId/loop/reviews`
  - `POST /v1/projects/:projectId/loop/rediagnostics`
  - `GET /v1/projects/:projectId/loop/evolution`

## M7 - Motor de IA

- Responsabilidade: sugestoes assistivas com evidencia e validacao humana.
- Endpoints:
  - `POST /v1/ai/transcriptions/interpret`
  - `POST /v1/ai/diagnosis/suggest`
  - `POST /v1/ai/premises/suggest`
  - `POST /v1/ai/suggestions/:suggestionId/validate`

## M8 - Portal do Cliente

- Responsabilidade: visualizacao de relatorios, comentarios e aprovacoes.
- Endpoints:
  - `GET /v1/client/projects/:projectId/dashboard`
  - `POST /v1/client/approvals/:approvalId/type1-register`
  - `POST /v1/client/approvals/:approvalId/type2-decision`
  - `POST /v1/client/publications/:publicationId/comments`

## M9 - Painel do Gestor

- Responsabilidade: visao consolidada de agencia e performance por consultor.
- Endpoints:
  - `GET /v1/manager/dashboard`
  - `GET /v1/manager/projects/:projectId/read-only`
  - `GET /v1/manager/reports/monthly`

## M10 - Administracao

- Responsabilidade: usuarios, parametros globais e templates.
- Endpoints:
  - `POST /v1/admin/users`
  - `PATCH /v1/admin/users/:userId`
  - `POST /v1/admin/configuration`
  - `GET /v1/admin/audit-logs`

## Modulos transversais

- **Aprovacoes e notificacoes:** controla tipo 1/tipo 2, SLA de resposta e lembretes.
- **Exports:** gera PDF/DOCX com identidade da marca.
- **Observabilidade e auditoria:** logs, tracing e eventos de seguranca.

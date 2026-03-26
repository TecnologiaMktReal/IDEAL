# Modelo de dados canonico

## Objetivos

1. Garantir rastreabilidade de decisoes e alteracoes.
2. Suportar versao de documentos e formularios metodologicos.
3. Manter segregacao entre dados internos e visiveis ao cliente.
4. Permitir analytics de maturidade e performance da agencia.

## Blocos principais

- **Identidade e acesso:** `users`, `project_members`, `roles`.
- **Core do projeto:** `projects`, `project_stage_state`, `stage_state_history`.
- **Documentos:** `documents`, `document_versions`, `document_publications`, `document_exports`.
- **IA e evidencias:** `transcripts`, `ai_suggestions`, `ai_validations`.
- **Diagnostico:** `diagnostic_scores_c1`, `diagnostic_scores_c2`, `cross_matrix_results`.
- **Planejamento e loop:** `architecture_actions`, `kpis`, `loop_reviews`, `rediagnostic_runs`.
- **Governanca:** `approvals`, `notifications`, `audit_logs`.

## Politicas

- `audit_logs` obrigatorio para cada acao sensivel.
- `approvals` com `type2_decision` bloqueia avancos de etapa.
- `document_publications` separa status interno do status publicado ao cliente.

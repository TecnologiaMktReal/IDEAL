# Workflow I-D-E-A-L e governanca

## Maquina de estados por etapa

- `not_started` -> `in_progress` -> `ready_for_completion` -> `completed`
- `completed` -> `reopened` (somente por gatilhos do Loop)

## Regras de transicao

1. Sequencia primaria obrigatoria: `I -> D -> E -> A -> L`.
2. Conclusao exige tres gates simultaneos:
   - checklist automatico da etapa
   - confirmacao manual do consultor
   - decisao obrigatoria do cliente (quando houver Tipo 2)
3. Gestor nao participa da aprovacao de conclusao de etapa.
4. Etapa L pode reabrir parcialmente:
   - `D` em rediagnosticos
   - `A` em ajuste de plano
   - `I` em mudanca estrutural relevante

## Eventos de dominio

- `stage.checklist_auto_passed`
- `stage.manual_confirmed`
- `approval.type2_registered`
- `stage.completed`
- `stage.reopened`

## Rastreabilidade

Toda mudanca de estado deve persistir:
- `projectId`
- `fromStatus`
- `toStatus`
- `actorUserId`
- `reason`
- `createdAt`

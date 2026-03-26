# RBAC do Sistema IDEAL

## Perfis

- `consultor`: opera a metodologia, preenche formularios e conclui etapas.
- `cliente`: visualiza entregas, comenta e decide aprovacoes tipo 2.
- `gestor`: visao consolidada da agencia e administracao de usuarios.

## Matriz resumida de autorizacao

| Acao | Consultor | Cliente | Gestor |
|---|---|---|---|
| Criar projeto | Sim | Nao | Sim |
| Preencher formularios internos | Sim | Nao | Leitura |
| Upload de transcricao | Sim | Nao | Nao |
| Acionar IA assistiva | Sim | Nao | Nao |
| Gerar/editar relatorios | Sim | Nao | Leitura |
| Publicar relatorio | Sim | Nao | Sim |
| Visualizar relatorios publicados | Sim | Sim | Sim |
| Download PDF/DOCX | Sim | Sim | Sim |
| Registrar ciencia (Tipo 1) | Nao | Sim | Nao |
| Tomar decisao (Tipo 2) | Nao | Sim | Nao |
| Comentar relatorios | Nao | Sim | Nao |
| Concluir etapa | Sim | Nao | Nao |
| Dashboard de projeto | Sim | Parcial | Sim |
| Dashboard de agencia | Nao | Nao | Sim |
| Gerenciar usuarios | Nao | Nao | Sim |

## Regras complementares

1. Toda acao sensivel grava auditoria (`usuario`, `acao`, `projectId`, `timestamp`, `payloadHash`).
2. Permissoes de gestor em formularios internos sao somente leitura.
3. Dados internos (dossie, notas e hipoteses) nunca sao expostos ao perfil cliente.

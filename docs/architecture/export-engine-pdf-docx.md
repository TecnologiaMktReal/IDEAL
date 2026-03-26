# Engine de exportacao PDF/DOCX

## Objetivo

Gerar documentos internos e externos com identidade MKT Real, controle de versao e rastreabilidade de publicacao.

## Pipeline

1. Receber `ExportRequest` com `projectId`, `stageCode`, `templateCode`, `format`.
2. Validar se template existe e pertence a etapa solicitada.
3. Montar payload de renderizacao (dados de negocio + metadados de marca).
4. Renderizar:
   - `pdf`: renderer HTML to PDF
   - `docx`: renderer DOCX template
5. Persistir arquivo em object storage.
6. Registrar `document_exports` para auditoria.

## Regras

- Todos os templates de cliente e internos suportam PDF e DOCX.
- Export de relatorio publicado ao cliente deve marcar classificacao "Confidencial".
- Nome de arquivo padrao: `{templateCode}-{timestamp}.{format}`.

## Templates por etapa

- I: Relatorio de Imersao + Dossie interno
- D: Relatorio de Diagnostico + Formularios internos
- E: Relatorio de Estrutura + Formulario interno
- A: Plano de Acao + Formulario interno
- L: Relatorio Inicial/Evolucao + Formulario de Loop

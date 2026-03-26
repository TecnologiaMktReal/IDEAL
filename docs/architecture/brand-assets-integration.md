# Integracao de brand assets

## Origem esperada

- Pasta fonte: `Material para FrontEnd`
- Destino no app web: `apps/web/public/brand`
- Destino no modulo de export: `packages/reports/templates/brand`

## Checklist de ingestao

1. Validar presenca dos arquivos obrigatorios do manifesto.
2. Gerar hash SHA256 por arquivo para rastreabilidade de versao visual.
3. Publicar `brandVersion` no `manifest.json`.
4. Atualizar tokens de tipografia e logotipo no design system.
5. Rodar snapshots de UI e modelos de relatorio PDF/DOCX.

## Regras de aplicacao

- Logo principal: dashboard web e capas de relatorio.
- Versao monocromatica: fundos escuros e marcas d'agua.
- Cores e espacamentos seguem manual oficial da marca.
- Se manual divergir da paleta PRD, prevalece manual de marca com registro da mudanca.

## Status atual da ingestao

- Arquivo encontrado e integrado:
  - `Material para FrontEnd/MKTREAL_IDVISUAL_MIVMKTREAL.pdf`
- Logo principal integrado a partir de imagem fornecida em assets do workspace:
  - `apps/web/public/brand/logo-primary.png`
  - `apps/web/public/brand/favicon.png`
  - `packages/reports/templates/brand/logo-primary.png`
- Logo monocromatica integrada a partir de imagem fornecida em assets do workspace:
  - `apps/web/public/brand/logo-monochrome.png`
  - `packages/reports/templates/brand/logo-monochrome.png`
- Fonte atual das logos (single source):
  - `https://tyneeznaprtomxuhmsti.supabase.co/storage/v1/object/public/IMAGE/LogoMktReal.png`
- Arquivo copiado para:
  - `apps/web/public/brand/MKTREAL_IDVISUAL_MIVMKTREAL.pdf`
  - `packages/reports/templates/brand/MKTREAL_IDVISUAL_MIVMKTREAL.pdf`
- Pendencias para finalizar branding visual no frontend:
  - Nenhuma pendencia obrigatoria no manifesto atual.

# Integracao Supabase (Auth, Storage, Database)

## Escopo aplicado

- **Auth:** email/senha inicialmente.
- **Database:** Postgres do Supabase usando schema do sistema IDEAL.
- **Storage:** buckets privados/publicos para transcricoes, relatorios e brand assets.

## Arquivos configurados

- Variaveis de ambiente:
  - `.env`
  - `.env.local`
  - `apps/api/.env`
  - `apps/web/.env.local`
- Clientes:
  - `apps/api/src/lib/supabase-admin.ts`
  - `apps/web/lib/supabase/client.ts`
- Healthcheck:
  - `GET /supabase/health` em `apps/api/src/main.ts`
- SQL:
  - `apps/api/db/schema.sql`
  - `apps/api/db/supabase-bootstrap.sql`
  - `apps/api/db/supabase-seed.sql`

## Fluxo recomendado de ativacao

1. Rodar `schema.sql` no SQL Editor do Supabase.
2. Rodar `supabase-bootstrap.sql` no SQL Editor.
3. Rodar `supabase-seed.sql` para criar organizacao, usuarios base e projeto inicial.
4. Criar usuarios de Auth via painel (email/senha).
5. Reexecutar o bloco de vinculo `users.auth_user_id` do seed (ou rodar seed novamente).
6. Testar endpoint `GET /supabase/health`.

## Buckets previstos

- `transcripts-private`
- `reports-private`
- `reports-client`
- `brand-assets`

## Observacoes

- `SUPABASE_SERVICE_ROLE_KEY` deve ser usada apenas no backend.
- Frontend deve usar apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

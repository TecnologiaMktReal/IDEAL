# Design system Liquid Glass

## Tokens base

- Primaria: `#85836C`
- Escura: `#222220`
- Accent: `#EAB817` (somente sobre fundo escuro quando necessario)
- Clara: `#F2F4F3`
- Superficie glass: `rgba(242,244,243,0.62)` + blur de `10px`

## Componentes base implementados

- `GlassCard`
- `GlassTopbar`
- `StageStepper`
- `KpiBoard`

## Regras de uso

1. Contraste minimo WCAG AA para textos e controles.
2. Evitar excesso de transparencias em areas com muitos dados.
3. Destaque visual de acoes criticas (aprovacao tipo 2 e bloqueios) com `accent`.
4. Estados de foco teclado obrigatorios em formularios e botoes.

## Integracao com Tailwind + shadcn

- Tokens devem ser refletidos em variaveis CSS globais.
- Componentes shadcn recebem wrappers Glass para consistencia visual.
- Storybook deve publicar variacoes light/dark com snapshots de regressao visual.

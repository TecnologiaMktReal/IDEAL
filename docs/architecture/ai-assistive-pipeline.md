# Pipeline de IA assistiva

## Camadas

1. **Automacao de calculo:** scores, classificacoes e dashboards automaticos.
2. **Pre-geracao de conteudo:** rascunhos de relatorios para revisao do consultor.
3. **Assistiva operacional:** interpretacao de transcricoes e sugestao de classificacoes.

## Fluxo operacional

1. Consultor faz upload de transcricao (`txt`, `docx`, `pdf`).
2. Job de IA segmenta trechos por pergunta e stakeholder.
3. IA gera sugestoes com:
   - valor sugerido
   - nivel de confianca
   - evidencias vinculadas (trechos originais)
4. Interface permite `approve`, `edit` ou `reject`.
5. Somente sugestoes aprovadas/editadas viram dado oficial.

## Regras de seguranca e qualidade

- Sem evidencia -> sem sugestao oficial.
- Toda sugestao guarda trilha de origem.
- IA nao conclui etapas nem publica relatorios.
- Nota final de diagnostico e sempre decisao do consultor.

## Eventos recomendados

- `ai.suggestion.generated`
- `ai.suggestion.validated`
- `ai.suggestion.rejected`
- `ai.batch.completed`

# Observabilidade e alertas

## Pilares

- **Logs estruturados:** formato JSON com `eventCode`, `moduleCode`, `projectId`, `userId`.
- **Metricas:** throughput, taxa de erro, latencia P95/P99 por endpoint e modulo.
- **Tracing:** spans de requests API e jobs assincros (IA, exportacao, notificacoes).
- **Auditoria:** eventos de seguranca e governanca gravados em banco.

## Dashboards recomendados

1. **Saude da plataforma:** uptime, erro global, latencia global.
2. **Saude por modulo M1-M10:** p95, erros por rota, saturacao de recursos.
3. **Jobs assincronos:** filas de IA/exports, tempo medio e retries.
4. **Governanca de etapas:** etapas bloqueadas, aprovacoes pendentes e backlog.

## Alertas minimos

- Erro API > 3% por 5 min (critico).
- P95 > 3000 ms por 10 min (alto).
- Fila de IA com atraso > 15 min (alto).
- Falha de exportacao > 5% no periodo (alto).
- Falha no backup diario (critico).

## SLOs iniciais

- Disponibilidade API: 99.5%
- Latencia P95 endpoints criticos: <= 3s
- Tempo de processamento IA (transcricao): <= 2 min
- Tempo de exportacao de relatorio: <= 3 min

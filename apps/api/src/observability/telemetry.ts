export interface LogEvent {
  eventCode: string;
  moduleCode: string;
  projectId?: string;
  userId?: string;
  severity: "info" | "warn" | "error";
  payload?: Record<string, unknown>;
}

export function buildStructuredLog(event: LogEvent) {
  return {
    timestamp: new Date().toISOString(),
    ...event
  };
}

export interface ModuleHealthMetric {
  moduleCode: string;
  requestCount: number;
  errorCount: number;
  p95LatencyMs: number;
}

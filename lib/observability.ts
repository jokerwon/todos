import { type NextFetchEvent } from "next/server";
import { type NextRequest } from "next/server";
import { onCLS, onFCP, onLCP, onTTFB, Metric } from "web-vitals";

type LogFn = (message: string, data?: Record<string, unknown>) => void;

const PERFORMANCE_BUDGETS = {
  taskCreateMs: 100,
  taskListP95: 2000,
  reminderLagSeconds: 60,
};

const log: LogFn = (message, data = {}) => {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.debug(`[observability] ${message}`, data);
  }
};

export function registerWebVitals(callback: (metric: Metric) => void) {
  if (typeof window === "undefined") return;

  onCLS(callback);
  onFCP(callback);
  onLCP(callback);
  onTTFB(callback);
}

export async function traceApiRequest(
  request: NextRequest,
  event: NextFetchEvent,
  handler: () => Promise<Response>,
) {
  const start = performance.now();
  const response = await handler();
  const duration = performance.now() - start;

  event.waitUntil(
    (async () => {
      log("api.request", {
        path: request.nextUrl.pathname,
        status: response.status,
        duration,
      });
    })(),
  );

  return response;
}

export function recordReminderLag(triggerAt: Date, deliveredAt: Date) {
  const lagSeconds = (deliveredAt.getTime() - triggerAt.getTime()) / 1000;
  log("reminder.lag", { lagSeconds });
  if (lagSeconds > PERFORMANCE_BUDGETS.reminderLagSeconds) {
    log("reminder.lag.budget_exceeded", { lagSeconds });
  }
}

export function getPerformanceBudgets() {
  return PERFORMANCE_BUDGETS;
}

"use client";

import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { registerWebVitals } from "@/lib/observability";

export function AnalyticsProvider() {
  useEffect(() => {
    registerWebVitals((metric) => {
      if (typeof window === "undefined") return;

      window.fetch("/api/internal/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metric }),
        keepalive: true,
      }).catch(() => {
        // swallow network errors in analytics reporting
      });
    });
  }, []);

  return <Analytics />;
}

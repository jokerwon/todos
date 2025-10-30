import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AnalyticsProvider } from "./providers/analytics-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SDD Practice TODOs",
  description: "Manage tasks, organize contexts, and stay on track with reminders.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  );
}

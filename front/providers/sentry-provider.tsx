"use client";

import * as Sentry from "@sentry/nextjs";
import { ReactNode } from "react";

interface SentryProviderProps {
  children: ReactNode;
}

export function SentryProvider({ children }: SentryProviderProps) {
  // Initialize Sentry once (client side)
  if (typeof window !== "undefined" && !Sentry.getCurrentHub().getClient()) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.5, // adjust as needed
      environment: process.env.NODE_ENV,
    });
  }

  return (
    <Sentry.ErrorBoundary fallback={<p>Something went wrong.</p>}>
      {children}
    </Sentry.ErrorBoundary>
  );
}

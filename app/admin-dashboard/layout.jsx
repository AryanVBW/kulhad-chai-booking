"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { ErrorBoundary } from "@/components/error-boundary";

export default function AdminLayout({
  children
}) {
  return (
    <ErrorBoundary>
      <ProtectedRoute adminOnly={true}>
        {children}
      </ProtectedRoute>
    </ErrorBoundary>
  );
}

/**
 * Form Display Components
 * Reusable components for displaying form data in admin detail view
 */

import type { ReactNode } from "react";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="font-medium">{title}</h3>
      {children}
    </section>
  );
}

export function Grid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
      {children}
    </div>
  );
}

export function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className={`${mono ? "font-mono" : "font-medium"} break-words`}>
        {value ?? "—"}
      </div>
    </div>
  );
}
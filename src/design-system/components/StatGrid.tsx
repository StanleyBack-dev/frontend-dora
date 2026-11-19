import type { ReactNode } from "react";

// The row of numbers at the top of a management page (StatCards): two per
// row on phones, four from lg up.
export function StatGrid({ children }: { children: ReactNode }) {
  return (
    <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {children}
    </div>
  );
}

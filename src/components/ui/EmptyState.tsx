import type { ReactNode } from 'react';

export function EmptyState({
  illustration,
  title,
  hint,
  action,
}: {
  illustration: ReactNode;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <div className="mb-5 h-28 w-28 text-brand-deep/70">{illustration}</div>
      <p className="font-display text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="mt-1.5 max-w-[16rem] text-sm text-ink-soft">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

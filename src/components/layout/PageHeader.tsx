import type { ReactNode } from 'react';

/** Header gradasi untuk halaman selain Beranda. Teks putih, judul memakai serif. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="grad-brand pt-safe text-white">
      <div className="mx-auto flex w-full max-w-md items-end justify-between gap-3 px-4 pb-5 pt-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-white">{subtitle}</p>}
        </div>
        {action}
      </div>
    </header>
  );
}

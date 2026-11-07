import { cn } from '../../utils/cn';

/**
 * Logo & Wordmark untuk header aplikasi Gia's Patisserie.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3.5', className)}>
      <div className="relative shrink-0 rounded-full bg-white p-0.5 shadow-md ring-2 ring-white/80">
        <img
          src="/logo-giaa.png"
          alt="Logo Gia's Patisserie"
          className="h-14 w-14 rounded-full object-cover"
        />
      </div>
      <div className="leading-tight">
        <h1 className="font-display text-xl font-bold tracking-tight text-white drop-shadow-sm">
          Gia's Patisserie
        </h1>
        <p className="text-xs font-medium tracking-wide text-white/90">
          Catatan Keuangan
        </p>
      </div>
    </div>
  );
}

import { cn } from '../../utils/cn';

/** Hati di atas pengocok adonan (whisk): motif identitas Giaa Patisserie. */
export function WhiskMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <path
        d="M24 13.4C22.5 10.4 17.5 11.3 17.5 15.8C17.5 19.8 21.9 22.4 24 24.3C26.1 22.4 30.5 19.8 30.5 15.8C30.5 11.3 25.5 10.4 24 13.4Z"
        fill="currentColor"
      />
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 24.6V29" />
        <path d="M24 29C18.4 30.6 18.4 37.6 24 39.8" />
        <path d="M24 29C29.6 30.6 29.6 37.6 24 39.8" />
        <path d="M24 29V39.8" />
        <path d="M19.4 35.4Q24 37.8 28.6 35.4" />
      </g>
    </svg>
  );
}

/**
 * Wordmark untuk header. Mewarisi warna teks dari induknya, jadi di header
 * gradasi cukup bungkus dengan teks putih.
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

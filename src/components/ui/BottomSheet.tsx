import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export function BottomSheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const sebelumnya = document.activeElement as HTMLElement | null;

    const fokusable = (): HTMLElement[] =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            ),
          ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
        : [];

    // Hormati autoFocus di dalam form (mis. input Nominal). Hanya ambil fokus
    // kalau belum ada elemen yang terfokus di dalam panel.
    if (panel && !panel.contains(document.activeElement)) {
      panel.focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const f = fokusable();
        if (f.length === 0) return;
        const pertama = f[0];
        const terakhir = f[f.length - 1];
        if (e.shiftKey && document.activeElement === pertama) {
          e.preventDefault();
          terakhir.focus();
        } else if (!e.shiftKey && document.activeElement === terakhir) {
          e.preventDefault();
          pertama.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    const overflowAwal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflowAwal;
      sebelumnya?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="animate-scrim-in absolute inset-0 bg-scrim" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="animate-sheet-in relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-4xl bg-bg shadow-sheet outline-none"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-4xl bg-bg px-5 pb-3 pt-4">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid h-10 w-10 place-items-center rounded-full text-ink-soft hover:bg-softer"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}

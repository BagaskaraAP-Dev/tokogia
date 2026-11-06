import { Plus } from 'lucide-react';

/** Tombol tambah melayang. Dibungkus kolom max-w-md supaya tetap di tepi kolom saat layar lebar. */
export function Fab({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-md">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="pointer-events-auto absolute bottom-[calc(4.75rem_+_env(safe-area-inset-bottom))] right-4 grid h-14 w-14 place-items-center rounded-full bg-brand-deep text-on-brand shadow-fab transition-transform active:scale-95"
      >
        <Plus size={26} strokeWidth={2.5} aria-hidden="true" />
      </button>
    </div>
  );
}

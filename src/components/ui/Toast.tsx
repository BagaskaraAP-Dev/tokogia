import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface AksiToast {
  label: string;
  jalankan: () => void;
}
interface IsiToast {
  pesan: string;
  aksi?: AksiToast;
}

const ToastContext = createContext<((isi: IsiToast) => void) | null>(null);

export function useToast(): (isi: IsiToast) => void {
  const tampilkan = useContext(ToastContext);
  if (!tampilkan) throw new Error('useToast harus dipakai di dalam ToastProvider.');
  return tampilkan;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<IsiToast | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const bersihkanTimer = () => {
    if (timer.current) window.clearTimeout(timer.current);
  };

  const tampilkan = useCallback((isi: IsiToast) => {
    bersihkanTimer();
    setToast(isi);
    timer.current = window.setTimeout(() => setToast(null), 7000);
  }, []);

  useEffect(() => () => bersihkanTimer(), []);

  return (
    <ToastContext.Provider value={tampilkan}>
      {children}
      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5rem_+_env(safe-area-inset-bottom))] z-[60] flex justify-center px-4">
          <div
            role="status"
            className="animate-fade-in pointer-events-auto flex w-full max-w-md items-center justify-between gap-3 rounded-2xl border border-line bg-card px-4 py-2.5 shadow-sheet"
          >
            <span className="text-sm text-ink">{toast.pesan}</span>
            {toast.aksi && (
              <button
                type="button"
                onClick={() => {
                  toast.aksi?.jalankan();
                  bersihkanTimer();
                  setToast(null);
                }}
                className="min-h-[2.5rem] shrink-0 rounded-full bg-brand-deep px-4 text-sm font-semibold text-on-brand"
              >
                {toast.aksi.label}
              </button>
            )}
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}

import { useEffect } from 'react';

/** Untuk overlay layar penuh: tutup dengan Escape dan kunci scroll latar selama terbuka. */
export function useOverlayDismiss(onClose: () => void): void {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const overflowAwal = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflowAwal;
    };
  }, [onClose]);
}

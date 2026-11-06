import { useEffect } from 'react';

interface WakeLockSentinelLike {
  release: () => Promise<void>;
}

/** Jaga layar tetap menyala selama `aktif` true, jika browser mendukung Wake Lock. */
export function useWakeLock(aktif: boolean): void {
  useEffect(() => {
    if (!aktif || !('wakeLock' in navigator)) return;

    let sentinel: WakeLockSentinelLike | null = null;
    let dibatalkan = false;

    const minta = async () => {
      try {
        const api = (navigator as Navigator & {
          wakeLock: { request: (t: 'screen') => Promise<WakeLockSentinelLike> };
        }).wakeLock;
        sentinel = await api.request('screen');
      } catch {
        // Ditolak atau tidak tersedia: abaikan, layar cuma tidak dijaga.
      }
    };

    void minta();

    const saatTampilLagi = () => {
      if (document.visibilityState === 'visible' && !dibatalkan) void minta();
    };
    document.addEventListener('visibilitychange', saatTampilLagi);

    return () => {
      dibatalkan = true;
      document.removeEventListener('visibilitychange', saatTampilLagi);
      void sentinel?.release().catch(() => {});
    };
  }, [aktif]);
}

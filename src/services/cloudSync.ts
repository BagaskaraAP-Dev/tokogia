import { useEffect, useState } from 'react';
import { isCloudAktif, sinkronisasiPenuhCloud } from './supabase';

export interface StatusSinkron {
  isCloudAktif: boolean;
  sedangSinkron: boolean;
  terakhirSinkron: number | null;
  online: boolean;
}

/**
 * Hook untuk memantau status sinkronisasi cloud
 */
export function useStatusCloud(): StatusSinkron {
  const [sedangSinkron, setSedangSinkron] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [terakhir, setTerakhir] = useState<number | null>(() => {
    try {
      const v = localStorage.getItem('giaa_terakhir_sinkron');
      return v ? Number(v) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    function onOnline() {
      setOnline(true);
      // Jika kembali online dan cloud aktif, lakukan sinkron otomatis
      if (isCloudAktif()) {
        setSedangSinkron(true);
        sinkronisasiPenuhCloud().finally(() => {
          setSedangSinkron(false);
          const v = localStorage.getItem('giaa_terakhir_sinkron');
          if (v) setTerakhir(Number(v));
        });
      }
    }

    function onOffline() {
      setOnline(false);
    }

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return {
    isCloudAktif: isCloudAktif(),
    sedangSinkron,
    terakhirSinkron: terakhir,
    online,
  };
}

/**
 * Jalankan sinkronisasi awal saat aplikasi dibuka
 */
export async function jalankanSinkronisasiAwal(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return;
  if (!isCloudAktif()) return;

  try {
    await sinkronisasiPenuhCloud();
  } catch (err) {
    console.warn('Sinkronisasi awal terlewat:', err);
  }
}

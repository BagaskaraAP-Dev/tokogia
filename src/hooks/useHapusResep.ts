import { useCallback } from 'react';
import { hapusResep, pulihkanResep } from '../db/db';
import { useToast } from '../components/ui/Toast';
import type { Resep } from '../types';

/** Hapus resep lalu tampilkan toast dengan tombol "Urungkan". */
export function useHapusResep(): (resep: Resep) => Promise<void> {
  const tampilkan = useToast();
  return useCallback(
    async (resep: Resep) => {
      await hapusResep(resep.id);
      tampilkan({
        pesan: 'Resep dihapus.',
        aksi: {
          label: 'Urungkan',
          jalankan: () => {
            void pulihkanResep(resep);
          },
        },
      });
    },
    [tampilkan],
  );
}

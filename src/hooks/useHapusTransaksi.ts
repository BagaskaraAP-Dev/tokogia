import { useCallback } from 'react';
import { hapusTransaksi, pulihkanTransaksi } from '../db/db';
import { useToast } from '../components/ui/Toast';
import type { Transaksi } from '../types';

/** Hapus transaksi lalu tampilkan toast dengan tombol "Urungkan". */
export function useHapusTransaksi(): (transaksi: Transaksi) => Promise<void> {
  const tampilkan = useToast();
  return useCallback(
    async (transaksi: Transaksi) => {
      await hapusTransaksi(transaksi.id);
      tampilkan({
        pesan: 'Transaksi dihapus.',
        aksi: {
          label: 'Urungkan',
          jalankan: () => {
            void pulihkanTransaksi(transaksi);
          },
        },
      });
    },
    [tampilkan],
  );
}

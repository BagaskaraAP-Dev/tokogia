import { useCallback } from 'react';
import { hapusTransaksi, pulihkanTransaksi } from '../db/db';
import { hapusTransaksiCloud, unggahTransaksiCloud } from '../services/supabase';
import { useToast } from '../components/ui/Toast';
import type { Transaksi } from '../types';

/** Hapus transaksi lalu tampilkan toast dengan tombol "Urungkan", serta sinkronkan ke cloud. */
export function useHapusTransaksi(): (transaksi: Transaksi) => Promise<void> {
  const tampilkan = useToast();
  return useCallback(
    async (transaksi: Transaksi) => {
      await hapusTransaksi(transaksi.id);
      void hapusTransaksiCloud(transaksi.id);

      tampilkan({
        pesan: 'Transaksi dihapus.',
        aksi: {
          label: 'Urungkan',
          jalankan: () => {
            void pulihkanTransaksi(transaksi);
            void unggahTransaksiCloud(transaksi);
          },
        },
      });
    },
    [tampilkan],
  );
}

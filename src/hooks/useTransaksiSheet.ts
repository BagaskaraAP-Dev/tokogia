import { useState } from 'react';
import type { Transaksi } from '../types';

export interface KontrolSheet {
  buka: boolean;
  transaksi: Transaksi | null;
  tambah: () => void;
  edit: (transaksi: Transaksi) => void;
  tutup: () => void;
}

export function useTransaksiSheet(): KontrolSheet {
  const [buka, setBuka] = useState(false);
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);

  return {
    buka,
    transaksi,
    tambah: () => {
      setTransaksi(null);
      setBuka(true);
    },
    edit: (t: Transaksi) => {
      setTransaksi(t);
      setBuka(true);
    },
    tutup: () => setBuka(false),
  };
}

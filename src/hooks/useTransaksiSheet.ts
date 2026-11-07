import { useState } from 'react';
import type { JenisTransaksi, Transaksi } from '../types';

export interface KontrolSheet {
  buka: boolean;
  transaksi: Transaksi | null;
  jenisDefault?: JenisTransaksi;
  tambah: (jenis?: JenisTransaksi) => void;
  edit: (transaksi: Transaksi) => void;
  tutup: () => void;
}

export function useTransaksiSheet(): KontrolSheet {
  const [buka, setBuka] = useState(false);
  const [transaksi, setTransaksi] = useState<Transaksi | null>(null);
  const [jenisDefault, setJenisDefault] = useState<JenisTransaksi | undefined>(undefined);

  return {
    buka,
    transaksi,
    jenisDefault,
    tambah: (jenis?: JenisTransaksi) => {
      setTransaksi(null);
      setJenisDefault(jenis);
      setBuka(true);
    },
    edit: (t: Transaksi) => {
      setTransaksi(t);
      setJenisDefault(undefined);
      setBuka(true);
    },
    tutup: () => setBuka(false),
  };
}

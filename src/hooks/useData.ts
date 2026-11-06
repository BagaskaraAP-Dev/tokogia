import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Kategori, Meta, Resep, Transaksi } from '../types';

/** Semua transaksi, terbaru dulu. Otomatis ikut berubah saat data berubah. */
export function useTransaksi(): Transaksi[] {
  return useLiveQuery(() => db.transaksi.orderBy('waktu').reverse().toArray(), [], []);
}

export function useKategori(): Kategori[] {
  return useLiveQuery(() => db.kategori.orderBy('nama').toArray(), [], []);
}

/** Resep, yang terbaru diubah dulu. */
export function useResep(): Resep[] {
  return useLiveQuery(() => db.resep.orderBy('diubah').reverse().toArray(), [], []);
}

export function useMeta(): Meta | undefined {
  return useLiveQuery(() => db.meta.get('app'), []);
}

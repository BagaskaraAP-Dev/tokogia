import Dexie, { type Table } from 'dexie';
import type { Kategori, LingkupKategori, Meta, Resep, Transaksi } from '../types';
import { buatId } from '../utils/id';

export class GiaaDB extends Dexie {
  transaksi!: Table<Transaksi, string>;
  kategori!: Table<Kategori, string>;
  resep!: Table<Resep, string>;
  meta!: Table<Meta, string>;

  constructor() {
    super('giaa-patisserie');
    this.version(1).stores({
      transaksi: 'id, waktu, jenis, kategori',
      kategori: 'id, nama, lingkup',
      resep: 'id, nama, kategori, diubah',
      meta: 'id',
    });
  }
}

export const db = new GiaaDB();

/** Id tetap supaya seed idempoten: dipanggil berkali-kali pun tidak menggandakan. */
const KATEGORI_BAWAAN: Kategori[] = [
  { id: 'bawaan-penjualan', nama: 'Penjualan', lingkup: 'masuk', bawaan: true },
  { id: 'bawaan-bahan-baku', nama: 'Bahan Baku', lingkup: 'keluar', bawaan: true },
  { id: 'bawaan-kemasan', nama: 'Kemasan', lingkup: 'keluar', bawaan: true },
  { id: 'bawaan-operasional', nama: 'Operasional', lingkup: 'keluar', bawaan: true },
  { id: 'bawaan-lainnya', nama: 'Lainnya', lingkup: 'umum', bawaan: true },
];

/** Isi kategori bawaan saat pertama kali dipakai. */
export async function pastikanSeed(): Promise<void> {
  const jumlah = await db.kategori.count();
  if (jumlah > 0) return;
  await db.kategori.bulkPut(KATEGORI_BAWAAN);
}

export async function tambahKategori(nama: string, lingkup: LingkupKategori): Promise<Kategori> {
  const kategori: Kategori = { id: buatId(), nama: nama.trim(), lingkup, bawaan: false };
  await db.kategori.add(kategori);
  return kategori;
}

export async function simpanTransaksi(transaksi: Transaksi): Promise<void> {
  await db.transaksi.put(transaksi);
}

export async function hapusTransaksi(id: string): Promise<void> {
  await db.transaksi.delete(id);
}

/** Kembalikan transaksi yang terlanjur dihapus (untuk tombol Urungkan). */
export async function pulihkanTransaksi(transaksi: Transaksi): Promise<void> {
  await db.transaksi.put(transaksi);
}

export async function simpanResep(resep: Resep): Promise<void> {
  await db.resep.put(resep);
}

export async function hapusResep(id: string): Promise<void> {
  await db.resep.delete(id);
}

export async function pulihkanResep(resep: Resep): Promise<void> {
  await db.resep.put(resep);
}

export async function ambilMeta(): Promise<Meta> {
  return (await db.meta.get('app')) ?? { id: 'app' };
}

export async function setBackupTerakhir(waktu: number): Promise<void> {
  const meta = await ambilMeta();
  await db.meta.put({ ...meta, backupTerakhir: waktu });
}

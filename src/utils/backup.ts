import { db, setBackupTerakhir } from '../db/db';
import { formatJam, tanggalISOWIB } from './date';
import type { Kategori, Resep, Transaksi } from '../types';

interface ResepBackup extends Omit<Resep, 'foto'> {
  fotoBase64?: string;
}

interface FileBackup {
  aplikasi: 'giaa-patisserie';
  versi: number;
  dibuat: number;
  transaksi: Transaksi[];
  kategori: Kategori[];
  resep: ResepBackup[];
}

function blobKeDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function dataUrlKeBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}

function unduhFile(nama: string, isi: string, mime: string): void {
  const blob = new Blob([isi], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nama;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function eksporBackup(): Promise<void> {
  const [transaksi, kategori, resep] = await Promise.all([
    db.transaksi.toArray(),
    db.kategori.toArray(),
    db.resep.toArray(),
  ]);

  const resepBackup: ResepBackup[] = await Promise.all(
    resep.map(async ({ foto, ...sisa }) => ({
      ...sisa,
      fotoBase64: foto ? await blobKeDataUrl(foto) : undefined,
    })),
  );

  const data: FileBackup = {
    aplikasi: 'giaa-patisserie',
    versi: 1,
    dibuat: Date.now(),
    transaksi,
    kategori,
    resep: resepBackup,
  };

  unduhFile(
    `giaa-backup-${tanggalISOWIB(Date.now())}.json`,
    JSON.stringify(data),
    'application/json',
  );
  await setBackupTerakhir(Date.now());
}

export async function imporBackup(file: File): Promise<{ transaksi: number; resep: number }> {
  const data = JSON.parse(await file.text()) as Partial<FileBackup>;
  if (data.aplikasi !== 'giaa-patisserie' || !Array.isArray(data.transaksi)) {
    throw new Error('File ini bukan backup Giaa Patisserie.');
  }

  const resep: Resep[] = await Promise.all(
    (data.resep ?? []).map(async ({ fotoBase64, ...sisa }) => ({
      ...sisa,
      foto: fotoBase64 ? await dataUrlKeBlob(fotoBase64) : undefined,
    })),
  );

  await db.transaction('rw', db.transaksi, db.kategori, db.resep, async () => {
    if (data.transaksi?.length) await db.transaksi.bulkPut(data.transaksi);
    if (data.kategori?.length) await db.kategori.bulkPut(data.kategori);
    if (resep.length) await db.resep.bulkPut(resep);
  });

  return { transaksi: data.transaksi.length, resep: resep.length };
}

function selCsv(nilai: string): string {
  if (/[;"\n\r]/.test(nilai)) return `"${nilai.replace(/"/g, '""')}"`;
  return nilai;
}

export async function eksporTransaksiCsv(): Promise<void> {
  const transaksi = await db.transaksi.orderBy('waktu').toArray();
  const baris: string[][] = [['Tanggal', 'Jam', 'Jenis', 'Nominal', 'Keterangan', 'Kategori']];
  for (const t of transaksi) {
    baris.push([
      tanggalISOWIB(t.waktu),
      formatJam(t.waktu),
      t.jenis === 'masuk' ? 'Pemasukan' : 'Pengeluaran',
      String(t.nominal),
      t.keterangan,
      t.kategori ?? '',
    ]);
  }
  // BOM + pemisah titik koma supaya rapi dibuka di Excel Indonesia.
  const csv = '﻿' + baris.map((r) => r.map(selCsv).join(';')).join('\r\n');
  unduhFile(`giaa-transaksi-${tanggalISOWIB(Date.now())}.csv`, csv, 'text/csv');
}

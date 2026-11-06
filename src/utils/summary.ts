import type { Transaksi } from '../types';
import {
  awalHariWIB,
  HARI_MS,
  rentangBulanIni,
  rentangBulanLalu,
  rentangHari,
  rentangKemarin,
  type Rentang,
} from './date';

export interface Ringkasan {
  masuk: number;
  keluar: number;
  saldo: number;
  jumlah: number;
}

export function ringkasanKosong(): Ringkasan {
  return { masuk: 0, keluar: 0, saldo: 0, jumlah: 0 };
}

export function dalamRentang(waktu: number, rentang: Rentang): boolean {
  return waktu >= rentang.mulai && waktu < rentang.selesai;
}

export function hitungRingkasan(transaksi: Transaksi[], rentang: Rentang): Ringkasan {
  const hasil = ringkasanKosong();
  for (const t of transaksi) {
    if (!dalamRentang(t.waktu, rentang)) continue;
    if (t.jenis === 'masuk') hasil.masuk += t.nominal;
    else hasil.keluar += t.nominal;
    hasil.jumlah += 1;
  }
  hasil.saldo = hasil.masuk - hasil.keluar;
  return hasil;
}

export type ArahPerubahan = 'naik' | 'turun' | 'sama' | 'baru';

export interface Perubahan {
  /** Persen dibulatkan. null berarti naik dari nol (tak terhingga) -> arah 'baru'. */
  persen: number | null;
  arah: ArahPerubahan;
}

export function persentasePerubahan(sekarang: number, sebelumnya: number): Perubahan {
  if (sebelumnya === 0) {
    if (sekarang === 0) return { persen: 0, arah: 'sama' };
    return { persen: null, arah: 'baru' };
  }
  const delta = ((sekarang - sebelumnya) / sebelumnya) * 100;
  if (delta > 0) return { persen: Math.round(delta), arah: 'naik' };
  if (delta < 0) return { persen: Math.round(delta), arah: 'turun' };
  return { persen: 0, arah: 'sama' };
}

export interface RingkasanBeranda {
  hariIni: Ringkasan;
  kemarin: Ringkasan;
  bulanIni: Ringkasan;
  bulanLalu: Ringkasan;
  /** Tren pemasukan: hari ini vs kemarin. */
  trenHarian: Perubahan;
  /** Tren pemasukan: bulan ini vs bulan lalu. */
  trenBulanan: Perubahan;
}

export function ringkasanBeranda(transaksi: Transaksi[], sekarang: number): RingkasanBeranda {
  const hariIni = hitungRingkasan(transaksi, rentangHari(sekarang));
  const kemarin = hitungRingkasan(transaksi, rentangKemarin(sekarang));
  const bulanIni = hitungRingkasan(transaksi, rentangBulanIni(sekarang));
  const bulanLalu = hitungRingkasan(transaksi, rentangBulanLalu(sekarang));
  return {
    hariIni,
    kemarin,
    bulanIni,
    bulanLalu,
    trenHarian: persentasePerubahan(hariIni.masuk, kemarin.masuk),
    trenBulanan: persentasePerubahan(bulanIni.masuk, bulanLalu.masuk),
  };
}

export interface BatangHari {
  mulai: number;
  total: number;
}

/** Total pemasukan tiap hari untuk 7 hari terakhir (termasuk hari ini), urut lama -> baru. */
export function pemasukan7Hari(transaksi: Transaksi[], sekarang: number): BatangHari[] {
  const hariIni = awalHariWIB(sekarang);
  const batang: BatangHari[] = [];
  for (let i = 6; i >= 0; i--) {
    const mulai = hariIni - i * HARI_MS;
    const selesai = mulai + HARI_MS;
    let total = 0;
    for (const t of transaksi) {
      if (t.jenis === 'masuk' && t.waktu >= mulai && t.waktu < selesai) total += t.nominal;
    }
    batang.push({ mulai, total });
  }
  return batang;
}

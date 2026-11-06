import { describe, expect, it } from 'vitest';
import type { Transaksi } from '../types';
import {
  rentangBulanIni,
  rentangBulanLalu,
  rentangHari,
  rentangKemarin,
  rentangMingguIni,
} from './date';
import {
  hitungRingkasan,
  pemasukan7Hari,
  persentasePerubahan,
  ringkasanBeranda,
} from './summary';

const WIB_MS = 7 * 60 * 60 * 1000;

/** Epoch untuk jam dinding WIB tertentu (bulan 1-12). */
function wib(y: number, m: number, d: number, h = 0, min = 0): number {
  return Date.UTC(y, m - 1, d, h, min) - WIB_MS;
}

let seq = 0;
function tx(jenis: Transaksi['jenis'], nominal: number, waktu: number): Transaksi {
  seq += 1;
  return { id: `t${seq}`, jenis, nominal, keterangan: 'uji', waktu, dibuat: waktu };
}

describe('hitungRingkasan', () => {
  it('menjumlahkan masuk, keluar, saldo, dan jumlah dalam rentang', () => {
    const now = wib(2026, 11, 6, 10, 0);
    const data = [
      tx('masuk', 150_000, wib(2026, 11, 6, 8, 0)),
      tx('masuk', 75_000, wib(2026, 11, 6, 9, 30)),
      tx('keluar', 40_000, wib(2026, 11, 6, 9, 45)),
      tx('masuk', 999_999, wib(2026, 11, 5, 23, 59)), // kemarin, diabaikan
    ];
    const r = hitungRingkasan(data, rentangHari(now));
    expect(r.masuk).toBe(225_000);
    expect(r.keluar).toBe(40_000);
    expect(r.saldo).toBe(185_000);
    expect(r.jumlah).toBe(3);
  });
});

describe('batas hari WIB', () => {
  const now = wib(2026, 11, 6, 10, 0);

  it('tengah malam WIB masuk hari ini, semenit sebelumnya masuk kemarin', () => {
    const tengahMalam = tx('masuk', 10_000, wib(2026, 11, 6, 0, 0));
    const sebelumnya = tx('masuk', 20_000, wib(2026, 11, 5, 23, 59));
    const data = [tengahMalam, sebelumnya];
    expect(hitungRingkasan(data, rentangHari(now)).masuk).toBe(10_000);
    expect(hitungRingkasan(data, rentangKemarin(now)).masuk).toBe(20_000);
  });

  it('epoch yang di UTC masih kemarin tapi di WIB sudah hari ini dihitung benar', () => {
    // 2026-11-05 18:00 UTC == 2026-11-06 01:00 WIB
    const lintasUtc = tx('masuk', 50_000, Date.UTC(2026, 10, 5, 18, 0));
    expect(hitungRingkasan([lintasUtc], rentangHari(now)).masuk).toBe(50_000);
    expect(hitungRingkasan([lintasUtc], rentangKemarin(now)).masuk).toBe(0);
  });
});

describe('pergantian bulan', () => {
  const now = wib(2026, 11, 6, 10, 0);

  it('memisahkan Oktober (bulan lalu) dan November (bulan ini)', () => {
    const akhirOkt = tx('masuk', 300_000, wib(2026, 10, 31, 23, 0));
    const awalNov = tx('masuk', 120_000, wib(2026, 11, 1, 0, 0));
    const data = [akhirOkt, awalNov];
    expect(hitungRingkasan(data, rentangBulanIni(now)).masuk).toBe(120_000);
    expect(hitungRingkasan(data, rentangBulanLalu(now)).masuk).toBe(300_000);
  });
});

describe('pergantian tahun', () => {
  const now = wib(2027, 1, 10, 10, 0);

  it('Desember 2026 jadi bulan lalu, Januari 2027 jadi bulan ini', () => {
    const akhir2026 = tx('masuk', 500_000, wib(2026, 12, 31, 23, 30));
    const awal2027 = tx('masuk', 80_000, wib(2027, 1, 1, 0, 30));
    const data = [akhir2026, awal2027];
    expect(hitungRingkasan(data, rentangBulanIni(now)).masuk).toBe(80_000);
    expect(hitungRingkasan(data, rentangBulanLalu(now)).masuk).toBe(500_000);
  });
});

describe('persentasePerubahan', () => {
  it('menghitung naik dan turun', () => {
    expect(persentasePerubahan(150, 100)).toEqual({ persen: 50, arah: 'naik' });
    expect(persentasePerubahan(80, 100)).toEqual({ persen: -20, arah: 'turun' });
  });

  it('nol ke nol = sama, angka ke nol = baru', () => {
    expect(persentasePerubahan(0, 0)).toEqual({ persen: 0, arah: 'sama' });
    expect(persentasePerubahan(100, 0)).toEqual({ persen: null, arah: 'baru' });
  });
});

describe('ringkasanBeranda', () => {
  it('menyusun tren harian dan bulanan dari pemasukan', () => {
    const now = wib(2026, 11, 6, 12, 0);
    const data = [
      tx('masuk', 200_000, wib(2026, 11, 6, 9, 0)), // hari ini
      tx('masuk', 100_000, wib(2026, 11, 5, 9, 0)), // kemarin
      tx('keluar', 50_000, wib(2026, 11, 6, 10, 0)),
      tx('masuk', 400_000, wib(2026, 10, 20, 9, 0)), // bulan lalu
    ];
    const r = ringkasanBeranda(data, now);
    expect(r.hariIni.masuk).toBe(200_000);
    expect(r.kemarin.masuk).toBe(100_000);
    expect(r.trenHarian).toEqual({ persen: 100, arah: 'naik' });
    // bulan ini = 200rb + 100rb (keduanya November), bulan lalu = 400rb
    expect(r.bulanIni.masuk).toBe(300_000);
    expect(r.bulanLalu.masuk).toBe(400_000);
    expect(r.trenBulanan).toEqual({ persen: -25, arah: 'turun' });
  });
});

describe('pemasukan7Hari', () => {
  const now = wib(2026, 11, 6, 15, 0);

  it('mengembalikan 7 keranjang, urut lama ke baru, hanya pemasukan', () => {
    const data = [
      tx('masuk', 100_000, wib(2026, 11, 6, 8, 0)), // hari ini
      tx('masuk', 60_000, wib(2026, 11, 4, 8, 0)), // 2 hari lalu
      tx('keluar', 500_000, wib(2026, 11, 6, 9, 0)), // pengeluaran, diabaikan
      tx('masuk', 999_999, wib(2026, 10, 30, 8, 0)), // 7 hari lalu, di luar jendela
    ];
    const batang = pemasukan7Hari(data, now);
    expect(batang).toHaveLength(7);
    expect(batang[6].total).toBe(100_000); // hari ini di posisi terakhir
    expect(batang[4].total).toBe(60_000); // dua hari sebelum hari ini
    expect(batang.reduce((a, b) => a + b.total, 0)).toBe(160_000);
  });
});

describe('rentangMingguIni', () => {
  it('mulai hari Senin', () => {
    // 2026-11-06 adalah Jumat; Senin minggu itu 2026-11-02
    const now = wib(2026, 11, 6, 15, 0);
    expect(rentangMingguIni(now).mulai).toBe(wib(2026, 11, 2, 0, 0));
    expect(rentangMingguIni(now).selesai).toBe(wib(2026, 11, 9, 0, 0));
  });
});

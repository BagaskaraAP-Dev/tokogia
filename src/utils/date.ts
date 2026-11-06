/**
 * Semua perhitungan tanggal memakai zona WIB (Asia/Jakarta, UTC+7, tanpa DST).
 * Transaksi disimpan sebagai epoch milidetik UTC; di sini kita petakan ke
 * tanggal kalender WIB dengan menggeser +7 jam lalu membaca bagian UTC-nya.
 */
export const JAM_MS = 60 * 60 * 1000;
export const HARI_MS = 24 * JAM_MS;
const WIB_OFFSET_MS = 7 * JAM_MS;

/** Rentang setengah terbuka: [mulai, selesai). */
export interface Rentang {
  mulai: number;
  selesai: number;
}

export interface BagianWaktu {
  tahun: number;
  /** 0-11 */
  bulan: number;
  hari: number;
  jam: number;
  menit: number;
}

export function bagianWIB(epochMs: number): BagianWaktu {
  const d = new Date(epochMs + WIB_OFFSET_MS);
  return {
    tahun: d.getUTCFullYear(),
    bulan: d.getUTCMonth(),
    hari: d.getUTCDate(),
    jam: d.getUTCHours(),
    menit: d.getUTCMinutes(),
  };
}

/** Epoch untuk tengah malam WIB pada hari yang memuat epochMs. */
export function awalHariWIB(epochMs: number): number {
  const { tahun, bulan, hari } = bagianWIB(epochMs);
  return Date.UTC(tahun, bulan, hari) - WIB_OFFSET_MS;
}

/** Epoch untuk tanggal 1 pukul 00:00 WIB pada bulan yang memuat epochMs. */
export function awalBulanWIB(epochMs: number): number {
  const { tahun, bulan } = bagianWIB(epochMs);
  return Date.UTC(tahun, bulan, 1) - WIB_OFFSET_MS;
}

export function rentangHari(epochMs: number): Rentang {
  const mulai = awalHariWIB(epochMs);
  return { mulai, selesai: mulai + HARI_MS };
}

export function rentangKemarin(epochMs: number): Rentang {
  const mulai = awalHariWIB(epochMs) - HARI_MS;
  return { mulai, selesai: mulai + HARI_MS };
}

/** Minggu dimulai Senin, sesuai kebiasaan Indonesia. */
export function rentangMingguIni(epochMs: number): Rentang {
  const awalHari = awalHariWIB(epochMs);
  const hariMinggu = new Date(awalHari + WIB_OFFSET_MS).getUTCDay(); // 0=Minggu..6=Sabtu
  const jarakKeSenin = (hariMinggu + 6) % 7;
  const mulai = awalHari - jarakKeSenin * HARI_MS;
  return { mulai, selesai: mulai + 7 * HARI_MS };
}

export function rentangBulanIni(epochMs: number): Rentang {
  const { tahun, bulan } = bagianWIB(epochMs);
  const mulai = Date.UTC(tahun, bulan, 1) - WIB_OFFSET_MS;
  const selesai = Date.UTC(tahun, bulan + 1, 1) - WIB_OFFSET_MS;
  return { mulai, selesai };
}

export function rentangBulanLalu(epochMs: number): Rentang {
  const { tahun, bulan } = bagianWIB(epochMs);
  const mulai = Date.UTC(tahun, bulan - 1, 1) - WIB_OFFSET_MS;
  const selesai = Date.UTC(tahun, bulan, 1) - WIB_OFFSET_MS;
  return { mulai, selesai };
}

const fmtJam = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Jakarta',
});

const fmtTanggalPanjang = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Jakarta',
});

const fmtHariSingkat = new Intl.DateTimeFormat('id-ID', {
  weekday: 'short',
  timeZone: 'Asia/Jakarta',
});

/** "14.32" */
export function formatJam(epochMs: number): string {
  return fmtJam.format(new Date(epochMs));
}

/** "Sen", "Sel", ... untuk label grafik. */
export function hariSingkat(epochMs: number): string {
  return fmtHariSingkat.format(new Date(epochMs));
}

/** "Senin, 3 Nov 2026" */
export function formatTanggalPanjang(epochMs: number): string {
  return fmtTanggalPanjang.format(new Date(epochMs));
}

/** Label grup harian untuk daftar transaksi. */
export function labelHariRelatif(epochMs: number, sekarang: number): string {
  const hariItu = awalHariWIB(epochMs);
  const hariIni = awalHariWIB(sekarang);
  if (hariItu === hariIni) return 'Hari ini';
  if (hariItu === hariIni - HARI_MS) return 'Kemarin';
  return formatTanggalPanjang(epochMs);
}

/** "2026-11-06" menurut WIB, untuk nama file dan ekspor CSV. */
export function tanggalISOWIB(epochMs: number): string {
  const { tahun, bulan, hari } = bagianWIB(epochMs);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${tahun}-${p(bulan + 1)}-${p(hari)}`;
}

/** Nilai untuk <input type="datetime-local">, memakai jam dinding WIB. */
export function keInputDatetimeLocal(epochMs: number): string {
  const d = new Date(epochMs + WIB_OFFSET_MS);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}T${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}

/** Tengah malam WIB dari nilai <input type="date"> ("YYYY-MM-DD"). */
export function awalHariDariInputTanggal(nilai: string): number {
  const [tahun, bulan, hari] = nilai.split('-').map(Number);
  return Date.UTC(tahun, bulan - 1, hari) - WIB_OFFSET_MS;
}

/** Baca nilai datetime-local (jam dinding WIB) kembali ke epoch UTC. */
export function dariInputDatetimeLocal(nilai: string): number {
  const [tanggal, waktu] = nilai.split('T');
  const [tahun, bulan, hari] = tanggal.split('-').map(Number);
  const [jam, menit] = waktu.split(':').map(Number);
  return Date.UTC(tahun, bulan - 1, hari, jam, menit) - WIB_OFFSET_MS;
}

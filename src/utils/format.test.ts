import { describe, expect, it } from 'vitest';
import { formatRibuan, formatRupiah, hanyaDigit } from './currency';
import {
  dariInputDatetimeLocal,
  formatJam,
  keInputDatetimeLocal,
  tanggalISOWIB,
} from './date';

const WIB_MS = 7 * 60 * 60 * 1000;
const wib = (y: number, m: number, d: number, h = 0, min = 0) =>
  Date.UTC(y, m - 1, d, h, min) - WIB_MS;

describe('formatRupiah', () => {
  it('memberi pemisah ribuan dan awalan Rp', () => {
    expect(formatRupiah(1_250_000)).toBe('Rp 1.250.000');
    expect(formatRupiah(0)).toBe('Rp 0');
  });

  it('menangani nilai negatif dan pembulatan', () => {
    expect(formatRupiah(-50_000)).toBe('-Rp 50.000');
    expect(formatRupiah(1999.6)).toBe('Rp 2.000');
  });
});

describe('input nominal', () => {
  it('menyisakan digit lalu memformat ribuan', () => {
    expect(hanyaDigit('Rp 1.250.000')).toBe('1250000');
    expect(formatRibuan('1250000')).toBe('1.250.000');
    expect(formatRibuan('')).toBe('');
  });
});

describe('tanggal WIB', () => {
  it('menghasilkan tanggal ISO WIB yang benar', () => {
    expect(tanggalISOWIB(wib(2026, 11, 6, 0, 0))).toBe('2026-11-06');
    // 2026-11-05 18:00 UTC sudah 2026-11-06 01:00 WIB
    expect(tanggalISOWIB(Date.UTC(2026, 10, 5, 18, 0))).toBe('2026-11-06');
  });

  it('memformat jam gaya Indonesia', () => {
    expect(formatJam(wib(2026, 11, 6, 14, 32))).toBe('14.32');
    expect(formatJam(wib(2026, 11, 6, 9, 5))).toBe('09.05');
  });

  it('input datetime-local bolak-balik tetap sama', () => {
    const epoch = wib(2026, 12, 31, 23, 30);
    const nilai = keInputDatetimeLocal(epoch);
    expect(nilai).toBe('2026-12-31T23:30');
    expect(dariInputDatetimeLocal(nilai)).toBe(epoch);
  });
});

const pengelompok = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** "Rp 1.250.000". Nilai negatif jadi "-Rp 50.000". */
export function formatRupiah(nilai: number): string {
  if (typeof nilai !== 'number' || isNaN(nilai)) return 'Rp 0';
  const bulat = Math.round(nilai);
  const tanda = bulat < 0 ? '-' : '';
  return `${tanda}Rp ${pengelompok.format(Math.abs(bulat))}`;
}

/** Sisakan digit saja dari teks input angka. */
export function hanyaDigit(teks: string): string {
  return teks.replace(/\D/g, '');
}

/** Beri titik ribuan untuk ditampilkan saat mengetik nominal. "1250000" -> "1.250.000". */
export function formatRibuan(digit: string): string {
  if (!digit) return '';
  return pengelompok.format(Number(digit));
}

import { describe, expect, it } from 'vitest';
import {
  buatTemplateEmailRekap,
  buatTemplateEmailTransaksi,
  buatTemplateEmailUjiCoba,
  formatRupiah,
} from '../../api/utils/emailTemplate.js';
import { EMAIL_TUJUAN_DEFAULT } from '../../api/utils/mailer.js';

describe('Sistem Template Email Laporan Gia\'s Patisserie', () => {
  it('harus memiliki email penerima default giacantik749@gmail.com', () => {
    expect(EMAIL_TUJUAN_DEFAULT).toBe('giacantik749@gmail.com');
  });

  it('memformat rupiah dengan tepat', () => {
    const formatted = formatRupiah(150000);
    expect(formatted).toContain('150.000');
  });

  it('membuat template email pemasukan dengan informasi lengkap', () => {
    const transaksi = {
      id: 'tx-1',
      jenis: 'masuk' as const,
      nominal: 250000,
      keterangan: 'Penjualan 5 toples Butter Cookies',
      kategori: 'Penjualan',
      waktu: Date.now(),
    };

    const template = buatTemplateEmailTransaksi({
      transaksi,
      ringkasanHariIni: {
        masuk: 500000,
        keluar: 100000,
        sisa: 400000,
      },
    });

    expect(template.subjek).toContain("Gia's Patisserie");
    expect(template.subjek).toContain('Pemasukan Baru');
    expect(template.subjek).toContain('250.000');
    expect(template.html).toContain('giacantik749@gmail.com');
    expect(template.html).toContain('Penjualan 5 toples Butter Cookies');
    expect(template.html).toContain('https://tokogia.vercel.app');
    expect(template.text).toContain('500.000');
  });

  it('membuat template email pengeluaran dengan warna aksen yang sesuai', () => {
    const transaksi = {
      id: 'tx-2',
      jenis: 'keluar' as const,
      nominal: 85000,
      keterangan: 'Beli Tepung Terigu & Mentega Wijsman',
      kategori: 'Bahan Baku',
      waktu: Date.now(),
    };

    const template = buatTemplateEmailTransaksi({ transaksi });

    expect(template.subjek).toContain('Pengeluaran Baru');
    expect(template.subjek).toContain('85.000');
    expect(template.html).toContain('Bahan Baku');
    expect(template.html).toContain('giacantik749@gmail.com');
  });

  it('membuat template rekapitulasi harian', () => {
    const template = buatTemplateEmailRekap({
      tanggalLabel: 'Senin, 16 November 2026',
      ringkasan: {
        masuk: 1200000,
        keluar: 350000,
        sisa: 850000,
      },
      daftarTransaksi: [
        {
          id: '1',
          jenis: 'masuk',
          nominal: 1200000,
          keterangan: 'Penjualan Hari Ini',
          waktu: Date.now(),
        },
      ],
    });

    expect(template.subjek).toContain('Rekap Laporan Keuangan');
    expect(template.html).toContain('1.200.000');
    expect(template.html).toContain('350.000');
    expect(template.html).toContain('giacantik749@gmail.com');
  });

  it('membuat template uji coba email', () => {
    const template = buatTemplateEmailUjiCoba();
    expect(template.subjek).toContain('Uji Coba Laporan Email Sukses');
    expect(template.html).toContain('giacantik749@gmail.com');
  });
});

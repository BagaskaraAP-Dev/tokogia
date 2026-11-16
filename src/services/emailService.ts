import type { Transaksi } from '../types';

export const EMAIL_TUJUAN_LAPORAN = 'giacantik749@gmail.com';

export interface RingkasanKeuangan {
  masuk: number;
  keluar: number;
  sisa: number;
}

export interface ResponEmail {
  success: boolean;
  message?: string;
  provider?: string;
  targetEmail?: string;
  error?: string;
  offline?: boolean;
}

/**
 * Kirim email notifikasi rincian transaksi baru ke giacantik749@gmail.com
 */
export async function kirimLaporanTransaksiBaru(
  transaksi: Transaksi,
  ringkasanHariIni?: RingkasanKeuangan,
): Promise<ResponEmail> {
  try {
    const payload = {
      type: 'transaksi',
      transaksi: {
        id: transaksi.id,
        jenis: transaksi.jenis,
        nominal: transaksi.nominal,
        keterangan: transaksi.keterangan,
        kategori: transaksi.kategori,
        waktu: transaksi.waktu,
      },
      ringkasanHariIni,
      emailTujuan: EMAIL_TUJUAN_LAPORAN,
    };

    const res = await fetch('/api/laporan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || `Server merespon dengan status ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message,
      provider: data.provider,
      targetEmail: data.targetEmail || EMAIL_TUJUAN_LAPORAN,
    };
  } catch (err: unknown) {
    // Jika perangkat sedang offline atau serverless belum aktif di dev
    console.warn('Gagal menghubungi endpoint /api/laporan:', err);
    return {
      success: false,
      offline: true,
      error: 'Perangkat sedang offline atau endpoint belum aktif.',
    };
  }
}

/**
 * Kirim email rekap harian / laporan lengkap ke giacantik749@gmail.com
 */
export async function kirimRekapHarianKeEmail(
  tanggalLabel: string,
  ringkasan: RingkasanKeuangan,
  daftarTransaksi: Transaksi[],
): Promise<ResponEmail> {
  try {
    const payload = {
      type: 'rekap',
      tanggalLabel,
      ringkasan,
      daftarTransaksi: daftarTransaksi.map((t) => ({
        id: t.id,
        jenis: t.jenis,
        nominal: t.nominal,
        keterangan: t.keterangan,
        kategori: t.kategori,
        waktu: t.waktu,
      })),
      emailTujuan: EMAIL_TUJUAN_LAPORAN,
    };

    const res = await fetch('/api/laporan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || `Gagal mengirim rekap (${res.status})`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message,
      provider: data.provider,
      targetEmail: data.targetEmail || EMAIL_TUJUAN_LAPORAN,
    };
  } catch (err: unknown) {
    console.error('Error kirim rekap harian:', err);
    return {
      success: false,
      offline: true,
      error: 'Gagal terhubung ke server backend.',
    };
  }
}

/**
 * Kirim email uji coba untuk memverifikasi bahwa email giacantik749@gmail.com menerima laporan
 */
export async function kirimUjiCobaEmail(): Promise<ResponEmail> {
  try {
    const res = await fetch('/api/laporan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'test',
        emailTujuan: EMAIL_TUJUAN_LAPORAN,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errData.error || `Gagal uji coba email (${res.status})`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      message: data.message,
      provider: data.provider,
      targetEmail: data.targetEmail || EMAIL_TUJUAN_LAPORAN,
    };
  } catch (err: unknown) {
    return {
      success: false,
      offline: true,
      error: 'Tidak dapat terhubung ke endpoint /api/laporan.',
    };
  }
}

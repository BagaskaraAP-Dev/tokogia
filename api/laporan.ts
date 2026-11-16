import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buatTemplateEmailRekap,
  buatTemplateEmailTransaksi,
  buatTemplateEmailUjiCoba,
} from './utils/emailTemplate.js';
import { EMAIL_TUJUAN_DEFAULT, kirimEmail } from './utils/mailer.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Atur CORS agar bisa diakses dari browser frontend & PWA
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      layanan: "Sistem Laporan Email Gia's Patisserie",
      emailTujuan: EMAIL_TUJUAN_DEFAULT,
      waktu: new Date().toISOString(),
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metode tidak didukung, gunakan POST' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { type, transaksi, ringkasanHariIni, tanggalLabel, ringkasan, daftarTransaksi, emailTujuan } = body || {};

    const targetEmail = emailTujuan || EMAIL_TUJUAN_DEFAULT;

    // 1. Uji coba email
    if (type === 'test') {
      const template = buatTemplateEmailUjiCoba();
      const hasil = await kirimEmail({
        to: targetEmail,
        subjek: template.subjek,
        html: template.html,
        text: template.text,
      });

      return res.status(200).json({
        success: hasil.sukses,
        provider: hasil.provider,
        message: hasil.catatan,
        targetEmail,
      });
    }

    // 2. Rekap harian / laporan lengkap
    if (type === 'rekap') {
      if (!ringkasan) {
        return res.status(400).json({ error: 'Data ringkasan diperlukan untuk jenis rekap' });
      }

      const template = buatTemplateEmailRekap({
        tanggalLabel: tanggalLabel || 'Hari ini',
        ringkasan,
        daftarTransaksi: Array.isArray(daftarTransaksi) ? daftarTransaksi : [],
      });

      const hasil = await kirimEmail({
        to: targetEmail,
        subjek: template.subjek,
        html: template.html,
        text: template.text,
      });

      return res.status(200).json({
        success: hasil.sukses,
        provider: hasil.provider,
        message: hasil.catatan,
        targetEmail,
      });
    }

    // 3. Notifikasi transaksi individual (Default)
    if (!transaksi || typeof transaksi.nominal !== 'number') {
      return res.status(400).json({ error: 'Data transaksi tidak valid' });
    }

    const template = buatTemplateEmailTransaksi({
      transaksi,
      ringkasanHariIni,
    });

    const hasil = await kirimEmail({
      to: targetEmail,
      subjek: template.subjek,
      html: template.html,
      text: template.text,
    });

    return res.status(200).json({
      success: hasil.sukses,
      provider: hasil.provider,
      message: hasil.catatan,
      targetEmail,
    });
  } catch (error: unknown) {
    console.error('Error saat memproses laporan email:', error);
    const pesan = error instanceof Error ? error.message : 'Terjadi kesalahan internal server';
    return res.status(500).json({ success: false, error: pesan });
  }
}

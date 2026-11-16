import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from './utils/supabaseServer.js';
import { ambilDariVercelBlob, simpanKeVercelBlob, simpanTransaksiCloud } from './utils/cloudStore.js';
import { buatTemplateEmailTransaksi } from './utils/emailTemplate.js';
import { EMAIL_TUJUAN_DEFAULT, kirimEmail } from './utils/mailer.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseServer();

  // 1. GET: Ambil daftar transaksi dari database cloud (Supabase atau Vercel Blob)
  if (req.method === 'GET') {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('transaksi')
          .select('*')
          .order('waktu', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
          success: true,
          online: true,
          provider: 'supabase',
          data: data || [],
        });
      } catch (err: unknown) {
        console.warn('Gagal ambil dari Supabase, coba fallback ke Blob:', err);
      }
    }

    // Fallback ke Vercel Blob
    try {
      const blobData = await ambilDariVercelBlob();
      return res.status(200).json({
        success: true,
        online: true,
        provider: 'vercel-blob',
        data: blobData?.transaksi || [],
      });
    } catch (err: unknown) {
      const pesan = err instanceof Error ? err.message : 'Gagal mengambil data transaksi online';
      return res.status(500).json({ success: false, error: pesan });
    }
  }

  // 2. POST: Simpan transaksi ke cloud & kirim laporan email ke giacantik749@gmail.com
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { transaksi, ringkasanHariIni, kirimNotif = true } = body || {};

      if (!transaksi || !transaksi.id || typeof transaksi.nominal !== 'number') {
        return res.status(400).json({ error: 'Data transaksi tidak lengkap' });
      }

      // Simpan ke cloud (Supabase & Vercel Blob)
      const hasilCloud = await simpanTransaksiCloud(transaksi);

      // Kirim email laporan rincian ke giacantik749@gmail.com
      let emailStatus = null;
      if (kirimNotif) {
        const template = buatTemplateEmailTransaksi({
          transaksi,
          ringkasanHariIni,
        });

        emailStatus = await kirimEmail({
          to: EMAIL_TUJUAN_DEFAULT,
          subjek: template.subjek,
          html: template.html,
          text: template.text,
        });
      }

      return res.status(200).json({
        success: true,
        id: transaksi.id,
        cloudTersimpan: hasilCloud.supabase || hasilCloud.blob,
        provider: hasilCloud.supabase ? 'supabase' : hasilCloud.blob ? 'vercel-blob' : 'lokal',
        emailStatus,
      });
    } catch (err: unknown) {
      const pesan = err instanceof Error ? err.message : 'Gagal memproses simpan transaksi';
      return res.status(500).json({ success: false, error: pesan });
    }
  }

  // 3. DELETE: Hapus transaksi dari database cloud
  if (req.method === 'DELETE') {
    const id = req.query.id as string;
    if (!id) {
      return res.status(400).json({ error: 'ID transaksi diperlukan' });
    }

    if (supabase) {
      try {
        await supabase.from('transaksi').delete().eq('id', id);
      } catch (e) {
        console.warn('Gagal hapus di Supabase:', e);
      }
    }

    try {
      const dataLama = await ambilDariVercelBlob();
      if (dataLama && Array.isArray(dataLama.transaksi)) {
        dataLama.transaksi = dataLama.transaksi.filter((t: any) => t.id !== id);
        dataLama.terakhirDiubah = Date.now();
        await simpanKeVercelBlob(dataLama);
      }
    } catch (e) {
      console.warn('Gagal hapus di Vercel Blob:', e);
    }

    return res.status(200).json({ success: true, id });
  }

  return res.status(405).json({ error: 'Metode tidak didukung' });
}

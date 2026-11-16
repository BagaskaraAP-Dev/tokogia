import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from './utils/supabaseServer';
import { buatTemplateEmailTransaksi } from './utils/emailTemplate';
import { EMAIL_TUJUAN_DEFAULT, kirimEmail } from './utils/mailer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseServer();

  // 1. GET: Ambil daftar transaksi dari database cloud
  if (req.method === 'GET') {
    if (!supabase) {
      return res.status(200).json({
        success: true,
        data: [],
        online: false,
        catatan: 'Database cloud belum terhubung. Konfigurasikan Supabase URL & Key di Pengaturan.',
      });
    }

    try {
      const { data, error } = await supabase
        .from('transaksi')
        .select('*')
        .order('waktu', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        online: true,
        data: data || [],
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

      let cloudTersimpan = false;

      // Simpan ke Supabase jika terhubung
      if (supabase) {
        const { error: dbError } = await supabase.from('transaksi').upsert(
          {
            id: transaksi.id,
            jenis: transaksi.jenis,
            nominal: transaksi.nominal,
            keterangan: transaksi.keterangan || '',
            kategori: transaksi.kategori || null,
            waktu: transaksi.waktu,
            dibuat: transaksi.dibuat || Date.now(),
          },
          { onConflict: 'id' },
        );

        if (dbError) {
          console.error('Gagal simpan ke Supabase:', dbError);
        } else {
          cloudTersimpan = true;
        }
      }

      // Kirim email laporan ke giacantik749@gmail.com
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
        cloudTersimpan,
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

    if (!supabase) {
      return res.status(200).json({ success: true, offline: true });
    }

    try {
      const { error } = await supabase.from('transaksi').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true, id });
    } catch (err: unknown) {
      const pesan = err instanceof Error ? err.message : 'Gagal menghapus transaksi dari cloud';
      return res.status(500).json({ success: false, error: pesan });
    }
  }

  return res.status(405).json({ error: 'Metode tidak didukung' });
}

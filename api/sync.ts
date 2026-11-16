import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from './utils/supabaseServer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseServer();

  if (!supabase) {
    return res.status(200).json({
      success: false,
      online: false,
      message: 'Database cloud belum terhubung di server. Atur SUPABASE_URL & SUPABASE_ANON_KEY di environment.',
    });
  }

  // 1. GET: Ambil seluruh data terkini dari cloud
  if (req.method === 'GET') {
    try {
      const [tRes, kRes, rRes] = await Promise.all([
        supabase.from('transaksi').select('*').order('waktu', { ascending: false }),
        supabase.from('kategori').select('*'),
        supabase.from('resep').select('*'),
      ]);

      return res.status(200).json({
        success: true,
        online: true,
        transaksi: tRes.data || [],
        kategori: kRes.data || [],
        resep: rRes.data || [],
      });
    } catch (err: unknown) {
      const pesan = err instanceof Error ? err.message : 'Gagal sinkronisasi data dari cloud';
      return res.status(500).json({ success: false, error: pesan });
    }
  }

  // 2. POST: Sinkronisasi dua arah (Unggah lokal & unduh yang baru dari cloud)
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { transaksi = [], kategori = [], resep = [] } = body || {};

      // Upsert transaksi lokal ke cloud
      if (Array.isArray(transaksi) && transaksi.length > 0) {
        const transaksiPayload = transaksi.map((t: any) => ({
          id: t.id,
          jenis: t.jenis,
          nominal: t.nominal,
          keterangan: t.keterangan || '',
          kategori: t.kategori || null,
          waktu: t.waktu,
          dibuat: t.dibuat || Date.now(),
        }));

        const { error: tErr } = await supabase
          .from('transaksi')
          .upsert(transaksiPayload, { onConflict: 'id' });

        if (tErr) console.error('Error upsert transaksi:', tErr);
      }

      // Upsert kategori lokal ke cloud
      if (Array.isArray(kategori) && kategori.length > 0) {
        const { error: kErr } = await supabase
          .from('kategori')
          .upsert(kategori, { onConflict: 'id' });

        if (kErr) console.error('Error upsert kategori:', kErr);
      }

      // Upsert resep lokal ke cloud
      if (Array.isArray(resep) && resep.length > 0) {
        const resepPayload = resep.map((r: any) => ({
          id: r.id,
          nama: r.nama,
          kategori: r.kategori,
          porsi: r.porsi || null,
          bahan: r.bahan || [],
          langkah: r.langkah || [],
          catatan: r.catatan || null,
          modal_bahan: r.modalBahan || null,
          harga_jual: r.hargaJual || null,
          dibuat: r.dibuat,
          diubah: r.diubah,
        }));

        const { error: rErr } = await supabase
          .from('resep')
          .upsert(resepPayload, { onConflict: 'id' });

        if (rErr) console.error('Error upsert resep:', rErr);
      }

      // Ambil data gabungan terbaru dari cloud untuk dikembalikan ke klien
      const [tRes, kRes, rRes] = await Promise.all([
        supabase.from('transaksi').select('*').order('waktu', { ascending: false }),
        supabase.from('kategori').select('*'),
        supabase.from('resep').select('*'),
      ]);

      return res.status(200).json({
        success: true,
        online: true,
        transaksi: tRes.data || [],
        kategori: kRes.data || [],
        resep: rRes.data || [],
      });
    } catch (err: unknown) {
      const pesan = err instanceof Error ? err.message : 'Gagal sinkronisasi ke cloud';
      return res.status(500).json({ success: false, error: pesan });
    }
  }

  return res.status(405).json({ error: 'Metode tidak didukung' });
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseServer } from './utils/supabaseServer';
import { ambilDariVercelBlob, simpanKeVercelBlob } from './utils/cloudStore';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseServer();

  // 1. GET: Ambil seluruh data terkini dari cloud
  if (req.method === 'GET') {
    if (supabase) {
      try {
        const [tRes, kRes, rRes] = await Promise.all([
          supabase.from('transaksi').select('*').order('waktu', { ascending: false }),
          supabase.from('kategori').select('*'),
          supabase.from('resep').select('*'),
        ]);

        return res.status(200).json({
          success: true,
          online: true,
          provider: 'supabase',
          transaksi: tRes.data || [],
          kategori: kRes.data || [],
          resep: rRes.data || [],
        });
      } catch (err: unknown) {
        console.warn('Gagal ambil data dari Supabase, coba fallback ke Blob:', err);
      }
    }

    try {
      const blob = await ambilDariVercelBlob();
      return res.status(200).json({
        success: true,
        online: true,
        provider: 'vercel-blob',
        transaksi: blob?.transaksi || [],
        kategori: blob?.kategori || [],
        resep: blob?.resep || [],
      });
    } catch (err: unknown) {
      const pesan = err instanceof Error ? err.message : 'Gagal sinkronisasi data dari cloud';
      return res.status(500).json({ success: false, error: pesan });
    }
  }

  // 2. POST: Sinkronisasi dua arah
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { transaksi = [], kategori = [], resep = [] } = body || {};

      let providerUsed = 'vercel-blob';

      // Jika Supabase ada, sinkronkan ke Supabase
      if (supabase) {
        providerUsed = 'supabase';
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

          await supabase.from('transaksi').upsert(transaksiPayload, { onConflict: 'id' });
        }

        if (Array.isArray(kategori) && kategori.length > 0) {
          await supabase.from('kategori').upsert(kategori, { onConflict: 'id' });
        }

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

          await supabase.from('resep').upsert(resepPayload, { onConflict: 'id' });
        }
      }

      // Selalu simpan juga cadangan ke Vercel Blob
      try {
        await simpanKeVercelBlob({
          transaksi,
          kategori,
          resep,
          terakhirDiubah: Date.now(),
        });
      } catch (e) {
        console.warn('Gagal simpan ke Vercel Blob:', e);
      }

      return res.status(200).json({
        success: true,
        online: true,
        provider: providerUsed,
        transaksi,
        kategori,
        resep,
      });
    } catch (err: unknown) {
      const pesan = err instanceof Error ? err.message : 'Gagal sinkronisasi ke cloud';
      return res.status(500).json({ success: false, error: pesan });
    }
  }

  return res.status(405).json({ error: 'Metode tidak didukung' });
}

import { put, list } from '@vercel/blob';
import { getSupabaseServer } from './supabaseServer';

const NAMA_FILE_TRANSAKSI = 'data/transaksi.json';

export interface CloudDataPayload {
  transaksi: any[];
  kategori?: any[];
  resep?: any[];
  terakhirDiubah: number;
}

/**
 * Simpan data transaksi ke Vercel Blob (Cloud Storage otomatis)
 */
export async function simpanKeVercelBlob(data: CloudDataPayload): Promise<string | null> {
  try {
    const blob = await put(NAMA_FILE_TRANSAKSI, JSON.stringify(data), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });
    return blob.url;
  } catch (err) {
    console.warn('Vercel Blob put gagal:', err);
    return null;
  }
}

/**
 * Ambil data transaksi dari Vercel Blob
 */
export async function ambilDariVercelBlob(): Promise<CloudDataPayload | null> {
  try {
    const { blobs } = await list({ prefix: NAMA_FILE_TRANSAKSI });
    if (!blobs || blobs.length === 0) return null;

    const target = blobs[0];
    const res = await fetch(target.url, { cache: 'no-store' });
    if (!res.ok) return null;

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Vercel Blob get gagal:', err);
    return null;
  }
}

/**
 * Simpan transaksi tunggal atau batch ke cloud (Supabase jika ada, atau Vercel Blob)
 */
export async function simpanTransaksiCloud(transaksiBaru: any): Promise<{
  supabase: boolean;
  blob: boolean;
}> {
  let supabaseOk = false;
  let blobOk = false;

  // 1. Supabase jika terkonfigurasi
  const supabase = getSupabaseServer();
  if (supabase) {
    try {
      const { error } = await supabase.from('transaksi').upsert(
        {
          id: transaksiBaru.id,
          jenis: transaksiBaru.jenis,
          nominal: transaksiBaru.nominal,
          keterangan: transaksiBaru.keterangan || '',
          kategori: transaksiBaru.kategori || null,
          waktu: transaksiBaru.waktu,
          dibuat: transaksiBaru.dibuat || Date.now(),
        },
        { onConflict: 'id' },
      );
      if (!error) supabaseOk = true;
    } catch (e) {
      console.warn('Gagal simpan ke Supabase:', e);
    }
  }

  // 2. Vercel Blob Storage
  try {
    const dataLama = (await ambilDariVercelBlob()) || {
      transaksi: [],
      terakhirDiubah: Date.now(),
    };

    const idx = dataLama.transaksi.findIndex((t: any) => t.id === transaksiBaru.id);
    if (idx >= 0) {
      dataLama.transaksi[idx] = transaksiBaru;
    } else {
      dataLama.transaksi.unshift(transaksiBaru);
    }
    dataLama.terakhirDiubah = Date.now();

    const url = await simpanKeVercelBlob(dataLama);
    if (url) blobOk = true;
  } catch (e) {
    console.warn('Gagal simpan ke Vercel Blob:', e);
  }

  return { supabase: supabaseOk, blob: blobOk };
}

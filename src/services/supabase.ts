import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { db } from '../db/db';
import type { Transaksi } from '../types';

const KUNCI_STORAGE_SUPABASE = 'giaa_supabase_cfg';

export interface KonfigurasiCloud {
  url: string;
  anonKey: string;
}

let supabaseInstance: SupabaseClient | null = null;

export function ambilKonfigurasiCloud(): KonfigurasiCloud | null {
  try {
    const raw = localStorage.getItem(KUNCI_STORAGE_SUPABASE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) return parsed;
    }
  } catch {
    // Abaikan jika localStorage tidak tersedia
  }

  // Fallback ke environment variable Vite
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  return null;
}

export function simpanKonfigurasiCloud(url: string, anonKey: string): void {
  const bersih = {
    url: url.trim().replace(/\/$/, ''),
    anonKey: anonKey.trim(),
  };
  localStorage.setItem(KUNCI_STORAGE_SUPABASE, JSON.stringify(bersih));
  supabaseInstance = null; // Reset instance agar dibuat ulang
}

export function hapusKonfigurasiCloud(): void {
  localStorage.removeItem(KUNCI_STORAGE_SUPABASE);
  supabaseInstance = null;
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const cfg = ambilKonfigurasiCloud();
  if (!cfg) return null;

  try {
    supabaseInstance = createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: false },
    });
    return supabaseInstance;
  } catch (e) {
    console.error('Gagal inisialisasi Supabase client:', e);
    return null;
  }
}

export function isCloudAktif(): boolean {
  return ambilKonfigurasiCloud() !== null;
}

/**
 * Unggah transaksi ke Supabase
 */
export async function unggahTransaksiCloud(t: Transaksi): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('transaksi').upsert(
      {
        id: t.id,
        jenis: t.jenis,
        nominal: t.nominal,
        keterangan: t.keterangan || '',
        kategori: t.kategori || null,
        waktu: t.waktu,
        dibuat: t.dibuat,
      },
      { onConflict: 'id' },
    );
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Gagal unggah transaksi ke Supabase:', e);
    return false;
  }
}

/**
 * Hapus transaksi dari Supabase
 */
export async function hapusTransaksiCloud(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('transaksi').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (e) {
    console.error('Gagal hapus transaksi dari Supabase:', e);
    return false;
  }
}

/**
 * Sinkronisasi penuh dua arah antara Dexie Lokal dan Cloud Supabase
 */
export async function sinkronisasiPenuhCloud(): Promise<{
  sukses: boolean;
  transaksiDiimpor: number;
  transaksiDiunggah: number;
  pesan?: string;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      sukses: false,
      transaksiDiimpor: 0,
      transaksiDiunggah: 0,
      pesan: 'Konfigurasi cloud Supabase belum terpasang.',
    };
  }

  try {
    // 1. Ambil data lokal
    const [lokalTransaksi, lokalKategori, lokalResep] = await Promise.all([
      db.transaksi.toArray(),
      db.kategori.toArray(),
      db.resep.toArray(),
    ]);

    // 2. Unggah data lokal ke Cloud
    if (lokalTransaksi.length > 0) {
      await supabase.from('transaksi').upsert(
        lokalTransaksi.map((t) => ({
          id: t.id,
          jenis: t.jenis,
          nominal: t.nominal,
          keterangan: t.keterangan || '',
          kategori: t.kategori || null,
          waktu: t.waktu,
          dibuat: t.dibuat,
        })),
        { onConflict: 'id' },
      );
    }

    if (lokalKategori.length > 0) {
      await supabase.from('kategori').upsert(
        lokalKategori.map((k) => ({
          id: k.id,
          nama: k.nama,
          lingkup: k.lingkup,
          bawaan: k.bawaan,
        })),
        { onConflict: 'id' },
      );
    }

    if (lokalResep.length > 0) {
      await supabase.from('resep').upsert(
        lokalResep.map((r) => ({
          id: r.id,
          nama: r.nama,
          kategori: r.kategori,
          porsi: r.porsi || null,
          bahan: r.bahan,
          langkah: r.langkah,
          catatan: r.catatan || null,
          modal_bahan: r.modalBahan || null,
          harga_jual: r.hargaJual || null,
          dibuat: r.dibuat,
          diubah: r.diubah,
        })),
        { onConflict: 'id' },
      );
    }

    // 3. Ambil data cloud terbaru dan gabungkan ke Dexie lokal
    const { data: cloudTransaksi, error: errT } = await supabase
      .from('transaksi')
      .select('*')
      .order('waktu', { ascending: false });

    if (errT) throw errT;

    let diimpor = 0;
    if (cloudTransaksi && cloudTransaksi.length > 0) {
      const items: Transaksi[] = cloudTransaksi.map((ct: any) => ({
        id: ct.id,
        jenis: ct.jenis,
        nominal: Number(ct.nominal),
        keterangan: ct.keterangan || '',
        kategori: ct.kategori || undefined,
        waktu: Number(ct.waktu),
        dibuat: Number(ct.dibuat),
      }));

      await db.transaksi.bulkPut(items);
      diimpor = items.length;
    }

    // Catat waktu sinkronisasi
    localStorage.setItem('giaa_terakhir_sinkron', String(Date.now()));

    return {
      sukses: true,
      transaksiDiimpor: diimpor,
      transaksiDiunggah: lokalTransaksi.length,
      pesan: `Sinkronisasi berhasil! ${diimpor} transaksi tersinkron online.`,
    };
  } catch (err: unknown) {
    console.error('Error saat sinkronisasi cloud:', err);
    return {
      sukses: false,
      transaksiDiimpor: 0,
      transaksiDiunggah: 0,
      pesan: err instanceof Error ? err.message : 'Gagal sinkronisasi data dengan cloud',
    };
  }
}

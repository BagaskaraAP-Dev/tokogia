import { useRef, useState } from 'react';
import {
  Cloud,
  Database,
  Download,
  FileSpreadsheet,
  Mail,
  RefreshCw,
  Send,
  Smartphone,
  TriangleAlert,
  Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { OnboardingTip } from '../components/OnboardingTip';
import { useToast } from '../components/ui/Toast';
import { useMeta, useTransaksi } from '../hooks/useData';
import { eksporBackup, eksporTransaksiCsv, imporBackup } from '../utils/backup';
import { HARI_MS, formatJam, formatTanggalPanjang, rentangHari } from '../utils/date';
import { hitungRingkasan } from '../utils/summary';
import {
  EMAIL_TUJUAN_LAPORAN,
  kirimRekapHarianKeEmail,
  kirimUjiCobaEmail,
} from '../services/emailService';
import {
  ambilKonfigurasiCloud,
  hapusKonfigurasiCloud,
  isCloudAktif,
  simpanKonfigurasiCloud,
  sinkronisasiPenuhCloud,
} from '../services/supabase';
import { useStatusCloud } from '../services/cloudSync';

function BarisAksi({
  icon: Icon,
  label,
  sublabel,
  sedangMemproses,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  sedangMemproses?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={sedangMemproses}
      className="flex w-full items-center gap-3 border-b border-line py-3.5 text-left transition-colors active:bg-softer disabled:opacity-60 last:border-0"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-softer text-brand-deep">
        {sedangMemproses ? (
          <RefreshCw size={18} className="animate-spin text-brand-deep" aria-hidden="true" />
        ) : (
          <Icon size={20} aria-hidden="true" />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{label}</span>
        {sublabel && <span className="block text-xs text-ink-soft">{sublabel}</span>}
      </span>
    </button>
  );
}

export function PengaturanPage() {
  const meta = useMeta();
  const semuaTransaksi = useTransaksi();
  const tampilkanToast = useToast();
  const inputImpor = useRef<HTMLInputElement>(null);
  const [tipTerbuka, setTipTerbuka] = useState(false);

  // Status sinkronisasi & email
  const statusCloud = useStatusCloud();
  const [sedangKirimEmail, setSedangKirimEmail] = useState(false);
  const [sedangKirimRekap, setSedangKirimRekap] = useState(false);
  const [sedangSinkronManual, setSedangSinkronManual] = useState(false);

  // Panel Konfigurasi Supabase
  const [panelCloudTerbuka, setPanelCloudTerbuka] = useState(false);
  const cfgTersimpan = ambilKonfigurasiCloud();
  const [inputUrl, setInputUrl] = useState(cfgTersimpan?.url || '');
  const [inputAnonKey, setInputAnonKey] = useState(cfgTersimpan?.anonKey || '');

  const backupTerakhir = meta?.backupTerakhir;
  const perluBackup = !backupTerakhir || Date.now() - backupTerakhir > 7 * HARI_MS;
  const labelBackup = backupTerakhir
    ? `${formatTanggalPanjang(backupTerakhir)}, ${formatJam(backupTerakhir)}`
    : 'Belum pernah dibackup';

  const waktuTerakhirSinkron = statusCloud.terakhirSinkron
    ? `${formatTanggalPanjang(statusCloud.terakhirSinkron)}, ${formatJam(statusCloud.terakhirSinkron)}`
    : 'Belum pernah';

  // 1. Ekspor & Impor
  async function jalankanEksporJson() {
    try {
      await eksporBackup();
      tampilkanToast({ pesan: 'Backup berhasil diunduh.' });
    } catch {
      tampilkanToast({ pesan: 'Gagal membuat backup.' });
    }
  }

  async function jalankanEksporCsv() {
    try {
      await eksporTransaksiCsv();
      tampilkanToast({ pesan: 'File CSV berhasil diunduh.' });
    } catch {
      tampilkanToast({ pesan: 'Gagal mengekspor CSV.' });
    }
  }

  async function jalankanImpor(file: File) {
    try {
      const hasil = await imporBackup(file);
      tampilkanToast({
        pesan: `Backup dipulihkan: ${hasil.transaksi} transaksi, ${hasil.resep} resep.`,
      });
    } catch (e) {
      tampilkanToast({ pesan: e instanceof Error ? e.message : 'Backup gagal dipulihkan.' });
    }
  }

  // 2. Aksi Notifikasi Email
  async function jalankanUjiCobaEmail() {
    setSedangKirimEmail(true);
    try {
      const hasil = await kirimUjiCobaEmail();
      if (hasil.success) {
        tampilkanToast({
          pesan: hasil.message || `Uji coba terkirim ke ${EMAIL_TUJUAN_LAPORAN}`,
        });
      } else {
        tampilkanToast({
          pesan: hasil.error || 'Gagal mengirim email uji coba.',
        });
      }
    } catch {
      tampilkanToast({ pesan: 'Terjadi gangguan koneksi saat mengirim email.' });
    } finally {
      setSedangKirimEmail(false);
    }
  }

  async function jalankanKirimRekapHariIni() {
    setSedangKirimRekap(true);
    try {
      const sekarang = Date.now();
      const rentang = rentangHari(sekarang);
      const ringkasan = hitungRingkasan(semuaTransaksi, rentang);
      const transaksiHariIni = semuaTransaksi.filter(
        (t) => t.waktu >= rentang.mulai && t.waktu < rentang.selesai,
      );

      const labelTanggal = formatTanggalPanjang(sekarang);
      const hasil = await kirimRekapHarianKeEmail(
        labelTanggal,
        { masuk: ringkasan.masuk, keluar: ringkasan.keluar, sisa: ringkasan.saldo },
        transaksiHariIni,
      );

      if (hasil.success) {
        tampilkanToast({
          pesan: `Rekap hari ini terkirim ke ${EMAIL_TUJUAN_LAPORAN}`,
        });
      } else {
        tampilkanToast({
          pesan: hasil.error || 'Gagal mengirim rekap laporan ke email.',
        });
      }
    } catch {
      tampilkanToast({ pesan: 'Terjadi gangguan saat membuat rekap laporan.' });
    } finally {
      setSedangKirimRekap(false);
    }
  }

  // 3. Aksi Sinkronisasi Cloud
  async function jalankanSinkronisasiManual() {
    if (!isCloudAktif()) {
      setPanelCloudTerbuka(true);
      tampilkanToast({ pesan: 'Masukkan URL & Key Supabase terlebih dahulu.' });
      return;
    }

    setSedangSinkronManual(true);
    try {
      const hasil = await sinkronisasiPenuhCloud();
      if (hasil.sukses) {
        tampilkanToast({ pesan: hasil.pesan || 'Sinkronisasi cloud berhasil!' });
      } else {
        tampilkanToast({ pesan: hasil.pesan || 'Gagal sinkronisasi ke cloud.' });
      }
    } catch (e) {
      tampilkanToast({ pesan: e instanceof Error ? e.message : 'Sinkronisasi gagal.' });
    } finally {
      setSedangSinkronManual(false);
    }
  }

  function simpanKoneksiSupabase() {
    if (!inputUrl || !inputAnonKey) {
      tampilkanToast({ pesan: 'URL dan Anon Key harus diisi.' });
      return;
    }
    simpanKonfigurasiCloud(inputUrl, inputAnonKey);
    setPanelCloudTerbuka(false);
    tampilkanToast({ pesan: 'Koneksi cloud disimpan! Menjalankan sinkronisasi awal...' });
    void jalankanSinkronisasiManual();
  }

  function putuskanKoneksiSupabase() {
    hapusKonfigurasiCloud();
    setInputUrl('');
    setInputAnonKey('');
    setPanelCloudTerbuka(false);
    tampilkanToast({ pesan: 'Koneksi cloud diputuskan. Aplikasi beralih ke mode lokal.' });
  }

  return (
    <>
      <PageHeader title="Pengaturan" />

      <div className="mx-auto w-full max-w-md space-y-4 px-4 py-5">
        {/* Banner Brand */}
        <div className="flex items-center gap-3.5 rounded-3xl bg-card p-4 shadow-card">
          <div className="relative shrink-0 rounded-full bg-white p-0.5 shadow-sm ring-2 ring-brand-deep/20">
            <img
              src="/logo-giaa.png"
              alt="Logo Gia's Patisserie"
              className="h-14 w-14 rounded-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold text-ink">Gia's Patisserie</p>
            <p className="text-xs text-ink-soft">
              {isCloudAktif() ? '☁️ Cloud Sinkronisasi Aktif' : '📱 Penyimpanan Lokal'} · v1.1
            </p>
          </div>
        </div>

        {/* Notifikasi Laporan Email */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-ink-soft">Laporan Email Masuk</h2>
            <span className="inline-flex items-center rounded-full bg-income/15 px-2.5 py-0.5 text-xs font-semibold text-income-ink dark:bg-income/25 dark:text-income">
              Otomatis Aktif
            </span>
          </div>

          <div className="rounded-3xl bg-card p-4 shadow-card space-y-3">
            <div className="flex items-start gap-3 rounded-2xl bg-softer p-3.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-deep text-white">
                <Mail size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink-soft">Email Tujuan Laporan</p>
                <p className="font-semibold text-sm text-ink break-all">{EMAIL_TUJUAN_LAPORAN}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
                  Setiap transaksi baru dicatat di kasir, rincian laporan otomatis dikirimkan ke email ini.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => void jalankanUjiCobaEmail()}
                disabled={sedangKirimEmail}
                className="flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl border border-line bg-card px-3 text-xs font-semibold text-ink transition-colors hover:bg-softer active:bg-line/40 disabled:opacity-50"
              >
                {sedangKirimEmail ? (
                  <RefreshCw size={14} className="animate-spin text-brand-deep" />
                ) : (
                  <Send size={14} className="text-brand-deep" />
                )}
                <span>Tes Kirim Email</span>
              </button>

              <button
                type="button"
                onClick={() => void jalankanKirimRekapHariIni()}
                disabled={sedangKirimRekap}
                className="flex min-h-[2.75rem] items-center justify-center gap-2 rounded-xl bg-brand-deep px-3 text-xs font-semibold text-white transition-opacity active:opacity-90 disabled:opacity-50 shadow-sm"
              >
                {sedangKirimRekap ? (
                  <RefreshCw size={14} className="animate-spin text-white" />
                ) : (
                  <Mail size={14} />
                )}
                <span>Rekap Hari Ini</span>
              </button>
            </div>
          </div>
        </section>

        {/* Akses Online & Sinkronisasi Cloud */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-ink-soft">Akses Online & Sinkronisasi</h2>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isCloudAktif()
                  ? 'bg-income/15 text-income-ink dark:bg-income/25 dark:text-income'
                  : 'bg-brand/15 text-brand-deep dark:bg-brand/25 dark:text-brand'
              }`}
            >
              {isCloudAktif() ? 'Tersambung ke Cloud' : 'Mode Lokal Saja'}
            </span>
          </div>

          <div className="rounded-3xl bg-card px-4 py-2 shadow-card">
            <BarisAksi
              icon={RefreshCw}
              label="Sinkronkan Sekarang"
              sublabel={`Sinkron terakhir: ${waktuTerakhirSinkron}`}
              sedangMemproses={sedangSinkronManual || statusCloud.sedangSinkron}
              onClick={() => void jalankanSinkronisasiManual()}
            />

            <BarisAksi
              icon={isCloudAktif() ? Cloud : Database}
              label="Koneksi Cloud (Supabase)"
              sublabel={
                isCloudAktif()
                  ? 'Data tersinkron otomatis antar perangkat'
                  : 'Hubungkan agar data tidak cuma sebatas lokal'
              }
              onClick={() => setPanelCloudTerbuka((v) => !v)}
            />

            {panelCloudTerbuka && (
              <div className="border-t border-line py-4 space-y-3">
                <div className="rounded-2xl bg-softer p-3 text-xs text-ink-soft leading-relaxed">
                  Data otomatis tersimpan di cloud sehingga kasir di toko kue dan pemilik di
                  rumah bisa melihat laporan keuangan yang sama secara real-time.
                </div>

                <div>
                  <label htmlFor="cfg-supabase-url" className="mb-1 block text-xs font-semibold text-ink-soft">
                    Supabase Project URL
                  </label>
                  <input
                    id="cfg-supabase-url"
                    type="url"
                    placeholder="https://xyzcompany.supabase.co"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="w-full rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink placeholder:text-ink-soft/60 focus:border-brand-deep focus:outline-none focus:ring-2 focus:ring-brand-deep/20"
                  />
                </div>

                <div>
                  <label htmlFor="cfg-supabase-key" className="mb-1 block text-xs font-semibold text-ink-soft">
                    Supabase Anon Public Key
                  </label>
                  <input
                    id="cfg-supabase-key"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={inputAnonKey}
                    onChange={(e) => setInputAnonKey(e.target.value)}
                    className="w-full rounded-xl border border-line bg-card px-3 py-2 text-xs text-ink placeholder:text-ink-soft/60 focus:border-brand-deep focus:outline-none focus:ring-2 focus:ring-brand-deep/20"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={simpanKoneksiSupabase}
                    className="flex-1 rounded-xl bg-brand-deep py-2.5 text-xs font-semibold text-white shadow-sm transition-opacity active:opacity-90"
                  >
                    Simpan & Sambungkan
                  </button>

                  {isCloudAktif() && (
                    <button
                      type="button"
                      onClick={putuskanKoneksiSupabase}
                      className="rounded-xl border border-line px-3 py-2.5 text-xs font-semibold text-expense-ink transition-colors hover:bg-rose-50"
                    >
                      Putuskan
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-ink-soft text-center">
                  Skema SQL siap pakai tersedia di folder <code className="font-mono text-brand-deep">supabase/schema.sql</code>.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Peringatan Backup Lokal */}
        {perluBackup && !isCloudAktif() && (
          <div className="flex items-start gap-3 rounded-2xl bg-softer p-4">
            <TriangleAlert size={20} className="mt-0.5 shrink-0 text-brand-deep" aria-hidden="true" />
            <p className="text-sm text-ink">
              {backupTerakhir
                ? 'Sudah lebih dari 7 hari sejak backup terakhir. Ekspor backup atau aktifkan sinkronisasi cloud agar data aman.'
                : 'Belum ada backup data lokal. Sambungkan ke cloud atau simpan backup agar data kasir tidak hilang.'}
            </p>
          </div>
        )}

        {/* Cadangan & Ekspor */}
        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-ink-soft">Cadangan & Ekspor Berkas</h2>
          <div className="rounded-3xl bg-card px-4 shadow-card">
            <BarisAksi
              icon={Download}
              label="Ekspor backup (.json)"
              sublabel={`Backup terakhir: ${labelBackup}`}
              onClick={() => void jalankanEksporJson()}
            />
            <BarisAksi
              icon={Upload}
              label="Impor backup"
              sublabel="Pulihkan data dari file .json"
              onClick={() => inputImpor.current?.click()}
            />
            <BarisAksi
              icon={FileSpreadsheet}
              label="Ekspor transaksi ke CSV"
              sublabel="Dapat dibuka di Microsoft Excel / Google Sheets"
              onClick={() => void jalankanEksporCsv()}
            />
          </div>
        </section>

        {/* Pasang Aplikasi */}
        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-ink-soft">Aplikasi PWA</h2>
          <div className="rounded-3xl bg-card px-4 shadow-card">
            <BarisAksi
              icon={Smartphone}
              label="Pasang ke Layar Utama (Home Screen)"
              sublabel="Buka seperti aplikasi asli, siap digunakan offline"
              onClick={() => setTipTerbuka(true)}
            />
          </div>
        </section>
      </div>

      <input
        ref={inputImpor}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void jalankanImpor(file);
          e.target.value = '';
        }}
      />

      <OnboardingTip open={tipTerbuka} onTutup={() => setTipTerbuka(false)} />
    </>
  );
}

import { useRef, useState } from 'react';
import { Download, FileSpreadsheet, Smartphone, TriangleAlert, Upload } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { OnboardingTip } from '../components/OnboardingTip';
import { useToast } from '../components/ui/Toast';
import { useMeta } from '../hooks/useData';
import { eksporBackup, eksporTransaksiCsv, imporBackup } from '../utils/backup';
import { HARI_MS, formatJam, formatTanggalPanjang } from '../utils/date';

function BarisAksi({
  icon: Icon,
  label,
  sublabel,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  sublabel?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 border-b border-line py-3.5 text-left last:border-0"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-softer text-brand-deep">
        <Icon size={20} aria-hidden="true" />
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
  const tampilkanToast = useToast();
  const inputImpor = useRef<HTMLInputElement>(null);
  const [tipTerbuka, setTipTerbuka] = useState(false);

  const backupTerakhir = meta?.backupTerakhir;
  const perluBackup = !backupTerakhir || Date.now() - backupTerakhir > 7 * HARI_MS;
  const labelBackup = backupTerakhir
    ? `${formatTanggalPanjang(backupTerakhir)}, ${formatJam(backupTerakhir)}`
    : 'Belum pernah dibackup';

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

  return (
    <>
      <PageHeader title="Pengaturan" />

      <div className="mx-auto w-full max-w-md space-y-4 px-4 py-5">
        <div className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-card">
          <img
            src="/logo-giaa.png"
            alt="Logo Giaa Patisserie"
            className="h-12 w-12 shrink-0 rounded-full object-cover"
          />
          <div>
            <p className="font-display text-base font-semibold text-ink">Giaa Patisserie</p>
            <p className="text-sm text-ink-soft">Catatan Keuangan · versi 1.0</p>
          </div>
        </div>

        {perluBackup && (
          <div className="flex items-start gap-3 rounded-2xl bg-softer p-4">
            <TriangleAlert size={20} className="mt-0.5 shrink-0 text-brand-deep" aria-hidden="true" />
            <p className="text-sm text-ink">
              {backupTerakhir
                ? 'Sudah lebih dari 7 hari sejak backup terakhir. Ekspor backup lagi biar data aman.'
                : 'Belum ada backup. Simpan backup agar data tidak hilang jika aplikasi terhapus.'}
            </p>
          </div>
        )}

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-ink-soft">Keamanan data</h2>
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
              sublabel="Pulihkan dari file .json"
              onClick={() => inputImpor.current?.click()}
            />
            <BarisAksi
              icon={FileSpreadsheet}
              label="Ekspor transaksi ke CSV"
              sublabel="Bisa dibuka di Excel"
              onClick={() => void jalankanEksporCsv()}
            />
          </div>
        </section>

        <section>
          <h2 className="mb-2 px-1 text-sm font-semibold text-ink-soft">Aplikasi</h2>
          <div className="rounded-3xl bg-card px-4 shadow-card">
            <BarisAksi
              icon={Smartphone}
              label="Pasang ke Home Screen"
              sublabel="Buka seperti aplikasi, data lebih aman"
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

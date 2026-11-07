import { useMemo, useRef, useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Plus,
  Receipt,
  Search,
  Wallet,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ReceiptIllustration } from '../components/illustrations/Pastry';
import { RingkasanBar, type FokusTransaksi } from '../components/finance/RingkasanBar';
import { DayGroupedList } from '../components/finance/DayGroupedList';
import { Fab } from '../components/finance/Fab';
import { TransaksiSheet } from '../components/finance/TransaksiSheet';
import { useKategori, useTransaksi } from '../hooks/useData';
import { useTransaksiSheet } from '../hooks/useTransaksiSheet';
import { useHapusTransaksi } from '../hooks/useHapusTransaksi';
import {
  HARI_MS,
  awalHariDariInputTanggal,
  rentangBulanIni,
  rentangBulanLalu,
  rentangHari,
  rentangKemarin,
  rentangMingguIni,
  type Rentang,
} from '../utils/date';
import { formatRupiah } from '../utils/currency';
import { cn } from '../utils/cn';
import type { Transaksi } from '../types';

type FilterId =
  | 'hari-ini'
  | 'kemarin'
  | 'minggu-ini'
  | 'bulan-ini'
  | 'bulan-lalu'
  | 'semua'
  | 'rentang';

const FILTER: { id: FilterId; label: string }[] = [
  { id: 'hari-ini', label: 'Hari ini' },
  { id: 'kemarin', label: 'Kemarin' },
  { id: 'minggu-ini', label: 'Minggu ini' },
  { id: 'bulan-ini', label: 'Bulan ini' },
  { id: 'bulan-lalu', label: 'Bulan lalu' },
  { id: 'semua', label: 'Semua' },
  { id: 'rentang', label: 'Rentang' },
];

function hitungRentang(filter: FilterId, sekarang: number, dari: string, sampai: string): Rentang | null {
  switch (filter) {
    case 'hari-ini':
      return rentangHari(sekarang);
    case 'kemarin':
      return rentangKemarin(sekarang);
    case 'minggu-ini':
      return rentangMingguIni(sekarang);
    case 'bulan-ini':
      return rentangBulanIni(sekarang);
    case 'bulan-lalu':
      return rentangBulanLalu(sekarang);
    case 'rentang': {
      if (!dari || !sampai) return null;
      const tDari = awalHariDariInputTanggal(dari);
      const tSampai = awalHariDariInputTanggal(sampai) + HARI_MS;
      return { mulai: Math.min(tDari, tSampai), selesai: Math.max(tDari, tSampai) };
    }
    case 'semua':
      return null;
  }
}

export function RiwayatPage() {
  const transaksi = useTransaksi();
  const kategori = useKategori();
  const sheet = useTransaksiSheet();
  const hapus = useHapusTransaksi();
  const sekarang = Date.now();

  // Otomatis mulai di 'hari-ini' setiap kali membuka halaman Riwayat
  const [filter, setFilter] = useState<FilterId>('hari-ini');
  const [fokus, setFokus] = useState<FokusTransaksi>('semua');
  const [kategoriFilter, setKategoriFilter] = useState<string | null>(null);
  const [cari, setCari] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');

  // Ref untuk deteksi gestur swipe geser ke kanan / kiri pada layar sentuh
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const rentang = useMemo(
    () => hitungRentang(filter, sekarang, dari, sampai),
    [filter, sekarang, dari, sampai],
  );

  // Transaksi dalam rentang waktu yang dipilih
  const transaksiRentang = useMemo(() => {
    return transaksi.filter((t) => {
      if (rentang && (t.waktu < rentang.mulai || t.waktu >= rentang.selesai)) return false;
      return true;
    });
  }, [transaksi, rentang]);

  // Hitung total masuk, keluar, dan saldo dalam periode
  const total = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    let countMasuk = 0;
    let countKeluar = 0;
    const rincianKeluarKategori: Record<string, number> = {};

    for (const t of transaksiRentang) {
      if (t.jenis === 'masuk') {
        masuk += t.nominal;
        countMasuk += 1;
      } else {
        keluar += t.nominal;
        countKeluar += 1;
        const kat = t.kategori || 'Tanpa Kategori';
        rincianKeluarKategori[kat] = (rincianKeluarKategori[kat] || 0) + t.nominal;
      }
    }

    return {
      masuk,
      keluar,
      saldo: masuk - keluar,
      countMasuk,
      countKeluar,
      countTotal: transaksiRentang.length,
      rincianKeluarKategori,
    };
  }, [transaksiRentang]);

  // Filter akhir (fokus pemasukan/pengeluaran + pencarian + filter kategori spesifik)
  const difilter = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return transaksiRentang.filter((t) => {
      if (fokus !== 'semua' && t.jenis !== fokus) return false;
      if (kategoriFilter && (t.kategori || 'Tanpa Kategori') !== kategoriFilter) return false;
      if (!kata) return true;
      return (
        t.keterangan.toLowerCase().includes(kata) ||
        (t.kategori?.toLowerCase().includes(kata) ?? false) ||
        String(t.nominal).includes(kata)
      );
    });
  }, [transaksiRentang, fokus, kategoriFilter, cari]);

  // Handler gestur swipe geser horizontal
  function handleTouchStart(e: React.TouchEvent) {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Pastikan gestur adalah horizontal dan melebihi batas sensitivitas (45px)
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) {
        // Geser ke kanan: jika sedang di 'semua' atau 'masuk', fokuskan ke 'keluar' (pengeluaran)
        if (fokus === 'semua') setFokus('keluar');
        else if (fokus === 'masuk') setFokus('semua');
        else if (fokus === 'keluar') setFokus('masuk');
      } else {
        // Geser ke kiri: pindah mode
        if (fokus === 'semua') setFokus('keluar');
        else if (fokus === 'keluar') setFokus('masuk');
        else if (fokus === 'masuk') setFokus('semua');
      }
    }
  }

  const labelPeriode = FILTER.find((f) => f.id === filter)?.label ?? 'Periode Ini';
  const inputTanggal =
    'min-h-[2.75rem] flex-1 rounded-xl border border-line bg-card px-3 text-base text-ink focus:border-brand-deep focus:outline-none';

  return (
    <>
      <PageHeader title="Riwayat" />

      <div
        className="mx-auto w-full max-w-md px-4 py-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Kolom Pencarian */}
        <label className="relative mb-3 block">
          <span className="sr-only">Cari transaksi</span>
          <Search
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
          />
          <input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari keterangan, kategori, atau nominal"
            className="min-h-[2.75rem] w-full rounded-xl border border-line bg-card pl-10 pr-3 text-base text-ink placeholder:text-ink-soft/70 focus:border-brand-deep focus:outline-none"
          />
        </label>

        {/* Pilihan Periode (Hari ini, Kemarin, Minggu ini, dst) */}
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
          {FILTER.map((f) => {
            const aktif = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={aktif}
                onClick={() => {
                  setFilter(f.id);
                  setKategoriFilter(null);
                }}
                className={cn(
                  'min-h-[2.5rem] shrink-0 rounded-full px-4 text-sm font-semibold transition-colors',
                  aktif ? 'bg-brand-deep text-on-brand shadow-sm' : 'bg-softer text-ink',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Filter Rentang Tanggal Khusus */}
        {filter === 'rentang' && (
          <div className="mb-4 flex items-center gap-2">
            <input
              type="date"
              aria-label="Dari tanggal"
              value={dari}
              onChange={(e) => setDari(e.target.value)}
              className={inputTanggal}
            />
            <span className="text-sm text-ink-soft">sampai</span>
            <input
              type="date"
              aria-label="Sampai tanggal"
              value={sampai}
              onChange={(e) => setSampai(e.target.value)}
              className={inputTanggal}
            />
          </div>
        )}

        {/* Carousel Kartu Fokus (Bisa digeser horizontal ke kanan untuk fokus Pengeluaran) */}
        <div className="-mx-4 mb-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
          {/* Kartu 1: Ringkasan Saldo (Semua) */}
          <div
            onClick={() => {
              setFokus('semua');
              setKategoriFilter(null);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setFokus('semua')}
            className={cn(
              'w-[86%] shrink-0 snap-start cursor-pointer rounded-3xl p-4 transition-all',
              fokus === 'semua'
                ? 'grad-brand text-white shadow-lg ring-2 ring-white/60'
                : 'bg-card text-ink shadow-card hover:bg-softer/40',
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-semibold uppercase tracking-wider', fokus === 'semua' ? 'text-white/85' : 'text-ink-soft')}>
                Ringkasan {labelPeriode}
              </span>
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold', fokus === 'semua' ? 'bg-white/20 text-white' : 'bg-softer text-ink-soft')}>
                <Wallet size={12} aria-hidden="true" />
                Semua
              </span>
            </div>
            <p className={cn('mt-2 font-display text-2xl font-bold tabular-nums', fokus === 'semua' ? 'text-white' : 'text-ink')}>
              {formatRupiah(total.saldo)}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-2 text-xs">
              <span className={fokus === 'semua' ? 'text-white/90' : 'text-income-ink'}>
                Masuk: <strong>{formatRupiah(total.masuk)}</strong>
              </span>
              <span className={fokus === 'semua' ? 'text-white/90' : 'text-expense-ink'}>
                Keluar: <strong>{formatRupiah(total.keluar)}</strong>
              </span>
            </div>
            <p className={cn('mt-2 flex items-center gap-1 text-[11px] font-medium', fokus === 'semua' ? 'text-white/80' : 'text-brand-deep')}>
              <span>Geser ke kanan untuk Fokus Pengeluaran</span>
              <ArrowRight size={12} aria-hidden="true" />
            </p>
          </div>

          {/* Kartu 2: FOKUS PENGELUARAN */}
          <div
            onClick={() => {
              setFokus('keluar');
              setKategoriFilter(null);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setFokus('keluar')}
            className={cn(
              'w-[86%] shrink-0 snap-start cursor-pointer rounded-3xl p-4 transition-all',
              fokus === 'keluar'
                ? 'bg-gradient-to-br from-[#c42b30] to-[#8f1d22] text-white shadow-lg ring-2 ring-white/60'
                : 'bg-card text-ink shadow-card hover:bg-softer/40',
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-semibold uppercase tracking-wider', fokus === 'keluar' ? 'text-white/85' : 'text-expense-ink')}>
                Fokus Pengeluaran · {labelPeriode}
              </span>
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold', fokus === 'keluar' ? 'bg-white text-[#c42b30]' : 'bg-rose-100 text-expense-ink')}>
                <ArrowDownRight size={13} aria-hidden="true" />
                {total.countKeluar} catatan
              </span>
            </div>
            <p className={cn('mt-2 font-display text-2xl font-bold tabular-nums', fokus === 'keluar' ? 'text-white' : 'text-expense-ink')}>
              {formatRupiah(total.keluar)}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-2 text-xs">
              <span className={fokus === 'keluar' ? 'text-white/90' : 'text-ink-soft'}>
                {total.countKeluar > 0
                  ? `${Object.keys(total.rincianKeluarKategori).length} kategori pengeluaran`
                  : 'Belum ada pengeluaran'}
              </span>
              <span className={fokus === 'keluar' ? 'font-bold text-white' : 'font-semibold text-brand-deep'}>
                {fokus === 'keluar' ? '✓ Mode Aktif' : 'Ketuk untuk fokus'}
              </span>
            </div>
            {total.countKeluar > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {Object.entries(total.rincianKeluarKategori)
                  .slice(0, 3)
                  .map(([kat, nom]) => (
                    <span
                      key={kat}
                      className={cn(
                        'rounded-lg px-2 py-0.5 text-[10px] font-medium',
                        fokus === 'keluar' ? 'bg-white/20 text-white' : 'bg-softer text-ink',
                      )}
                    >
                      {kat}: {formatRupiah(nom)}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Kartu 3: FOKUS PEMASUKAN */}
          <div
            onClick={() => {
              setFokus('masuk');
              setKategoriFilter(null);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setFokus('masuk')}
            className={cn(
              'w-[86%] shrink-0 snap-start cursor-pointer rounded-3xl p-4 transition-all',
              fokus === 'masuk'
                ? 'bg-gradient-to-br from-[#1b8a52] to-[#125c37] text-white shadow-lg ring-2 ring-white/60'
                : 'bg-card text-ink shadow-card hover:bg-softer/40',
            )}
          >
            <div className="flex items-center justify-between">
              <span className={cn('text-xs font-semibold uppercase tracking-wider', fokus === 'masuk' ? 'text-white/85' : 'text-income-ink')}>
                Fokus Pemasukan · {labelPeriode}
              </span>
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold', fokus === 'masuk' ? 'bg-white text-[#1b8a52]' : 'bg-emerald-100 text-income-ink')}>
                <ArrowUpRight size={13} aria-hidden="true" />
                {total.countMasuk} catatan
              </span>
            </div>
            <p className={cn('mt-2 font-display text-2xl font-bold tabular-nums', fokus === 'masuk' ? 'text-white' : 'text-income-ink')}>
              {formatRupiah(total.masuk)}
            </p>
            <div className="mt-3 flex items-center justify-between border-t border-white/20 pt-2 text-xs">
              <span className={fokus === 'masuk' ? 'text-white/90' : 'text-ink-soft'}>
                {total.countMasuk} penjualan berhasil dicatat
              </span>
              <span className={fokus === 'masuk' ? 'font-bold text-white' : 'font-semibold text-income-ink'}>
                {fokus === 'masuk' ? '✓ Mode Aktif' : 'Ketuk untuk fokus'}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Tab Pilihan Cepat (Semua / Pengeluaran / Pemasukan) */}
        <div className="mb-4 flex rounded-2xl bg-softer p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setFokus('semua');
              setKategoriFilter(null);
            }}
            className={cn(
              'flex-1 rounded-xl py-2 text-center transition-all',
              fokus === 'semua'
                ? 'bg-card text-ink shadow-sm'
                : 'text-ink-soft hover:text-ink',
            )}
          >
            Semua ({total.countTotal})
          </button>
          <button
            type="button"
            onClick={() => {
              setFokus('keluar');
              setKategoriFilter(null);
            }}
            className={cn(
              'flex-1 rounded-xl py-2 text-center transition-all',
              fokus === 'keluar'
                ? 'bg-card text-expense-ink shadow-sm ring-1 ring-expense-ink/20'
                : 'text-ink-soft hover:text-expense-ink',
            )}
          >
            Pengeluaran ({total.countKeluar})
          </button>
          <button
            type="button"
            onClick={() => {
              setFokus('masuk');
              setKategoriFilter(null);
            }}
            className={cn(
              'flex-1 rounded-xl py-2 text-center transition-all',
              fokus === 'masuk'
                ? 'bg-card text-income-ink shadow-sm ring-1 ring-income-ink/20'
                : 'text-ink-soft hover:text-income-ink',
            )}
          >
            Pemasukan ({total.countMasuk})
          </button>
        </div>

        {/* Ringkasan Bar Cepat (Bisa diklik untuk ganti fokus) */}
        <div className="mb-4">
          <RingkasanBar
            masuk={total.masuk}
            keluar={total.keluar}
            saldo={total.saldo}
            fokus={fokus}
            onPilihFokus={(f) => {
              setFokus(f);
              setKategoriFilter(null);
            }}
          />
        </div>

        {/* Banner Mode Fokus Pengeluaran */}
        {fokus === 'keluar' && (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-expense-ink">
                <ArrowDownRight size={18} aria-hidden="true" />
                <span className="text-sm font-bold">Sedang Fokus Pengeluaran</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setFokus('semua');
                  setKategoriFilter(null);
                }}
                className="text-xs font-semibold text-ink-soft underline hover:text-ink"
              >
                Tampilkan Semua
              </button>
            </div>

            {/* Filter Cepat Per Kategori Pengeluaran */}
            {Object.keys(total.rincianKeluarKategori).length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setKategoriFilter(null)}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold transition-colors',
                    kategoriFilter === null
                      ? 'bg-expense-ink text-white'
                      : 'bg-white text-ink shadow-xs dark:bg-card',
                  )}
                >
                  Semua Kategori
                </button>
                {Object.entries(total.rincianKeluarKategori).map(([kat, nom]) => {
                  const aktif = kategoriFilter === kat;
                  return (
                    <button
                      key={kat}
                      type="button"
                      onClick={() => setKategoriFilter(aktif ? null : kat)}
                      className={cn(
                        'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                        aktif
                          ? 'bg-expense-ink text-white font-semibold'
                          : 'bg-white text-ink shadow-xs dark:bg-card',
                      )}
                    >
                      <span>{kat}</span>
                      <span className="opacity-75">({formatRupiah(nom)})</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Banner Mode Fokus Pemasukan */}
        {fokus === 'masuk' && (
          <div className="mb-4 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 text-income-ink">
              <ArrowUpRight size={18} aria-hidden="true" />
              <span className="text-sm font-bold">Sedang Fokus Pemasukan</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setFokus('semua');
                setKategoriFilter(null);
              }}
              className="text-xs font-semibold text-ink-soft underline hover:text-ink"
            >
              Tampilkan Semua
            </button>
          </div>
        )}

        {/* Daftar Transaksi */}
        {transaksi.length === 0 ? (
          <EmptyState
            illustration={<ReceiptIllustration className="h-full w-full" />}
            title="Riwayat masih kosong"
            hint="Semua transaksi yang kamu catat tersimpan di sini dan bisa difilter per hari, minggu, atau bulan."
          />
        ) : difilter.length === 0 ? (
          <div className="rounded-3xl bg-card p-6 text-center shadow-card">
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-softer text-brand-deep">
              <Receipt size={24} aria-hidden="true" />
            </div>
            <h3 className="font-display text-base font-semibold text-ink">
              {fokus === 'keluar'
                ? `Belum ada pengeluaran di ${labelPeriode}`
                : fokus === 'masuk'
                  ? `Belum ada pemasukan di ${labelPeriode}`
                  : 'Tidak ada transaksi yang cocok'}
            </h3>
            <p className="mt-1 text-xs text-ink-soft">
              {fokus === 'keluar'
                ? 'Tidak ada catatan belanja/pengeluaran untuk periode yang dipilih.'
                : 'Coba ubah filter periode atau kata pencarian.'}
            </p>
            {fokus === 'keluar' && (
              <button
                type="button"
                onClick={() => sheet.tambah('keluar')}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-deep px-4 py-2 text-sm font-semibold text-white shadow-sm"
              >
                <Plus size={16} aria-hidden="true" />
                Catat Pengeluaran
              </button>
            )}
          </div>
        ) : (
          <DayGroupedList
            transaksi={difilter}
            sekarang={sekarang}
            onBuka={sheet.edit}
            onHapus={(t: Transaksi) => void hapus(t)}
          />
        )}
      </div>

      <Fab onClick={() => sheet.tambah(fokus === 'keluar' ? 'keluar' : 'masuk')} label="Catat transaksi" />
      <TransaksiSheet
        buka={sheet.buka}
        transaksi={sheet.transaksi}
        jenisDefault={sheet.jenisDefault ?? (fokus === 'keluar' ? 'keluar' : 'masuk')}
        kategori={kategori}
        onTutup={sheet.tutup}
      />
    </>
  );
}

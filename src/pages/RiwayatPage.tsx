import { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  Filter,
  Layers,
  List,
  Plus,
  Search,
  Upload,
  Wallet,
  X,
} from 'lucide-react';
import { TransaksiSheet } from '../components/finance/TransaksiSheet';
import { useKategori, useTransaksi } from '../hooks/useData';
import { useTransaksiSheet } from '../hooks/useTransaksiSheet';
import { useHapusTransaksi } from '../hooks/useHapusTransaksi';
import {
  HARI_MS,
  awalHariDariInputTanggal,
  formatJam,
  labelHariRelatif,
  rentangBulanIni,
  rentangHari,
  rentangKemarin,
  rentangMingguIni,
  type Rentang,
} from '../utils/date';
import { formatRupiah } from '../utils/currency';
import { cn } from '../utils/cn';
import type { Transaksi } from '../types';
import { SwipeRow } from '../components/finance/SwipeRow';

type FilterPeriodeId =
  | 'hari-ini'
  | 'kemarin'
  | 'minggu-ini'
  | 'bulan-ini'
  | 'kustom';

type FokusTransaksi = 'semua' | 'keluar' | 'masuk';

const DAFTAR_PERIODE: { id: FilterPeriodeId; label: string; denganIkon?: boolean }[] = [
  { id: 'hari-ini', label: 'Hari ini' },
  { id: 'kemarin', label: 'Kemarin' },
  { id: 'minggu-ini', label: 'Minggu ini' },
  { id: 'bulan-ini', label: 'Bulan ini' },
  { id: 'kustom', label: 'Kustom', denganIkon: true },
];

function hitungRentangWaktu(
  filter: FilterPeriodeId,
  sekarang: number,
  dari: string,
  sampai: string,
): Rentang | null {
  switch (filter) {
    case 'hari-ini':
      return rentangHari(sekarang);
    case 'kemarin':
      return rentangKemarin(sekarang);
    case 'minggu-ini':
      return rentangMingguIni(sekarang);
    case 'bulan-ini':
      return rentangBulanIni(sekarang);
    case 'kustom': {
      if (!dari || !sampai) return null;
      const tDari = awalHariDariInputTanggal(dari);
      const tSampai = awalHariDariInputTanggal(sampai) + HARI_MS;
      return { mulai: Math.min(tDari, tSampai), selesai: Math.max(tDari, tSampai) };
    }
  }
}

/**
 * Ilustrasi Resi Struk Khas Gia's Patisserie
 * Meniru persis grafik lingkaran bercahaya dengan kertas struk pink bergerigi di contoh.webp
 */
function IlustrasiResiStruk() {
  return (
    <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
      {/* Kilauan / Sparkle di kanan atas */}
      <svg
        className="absolute -right-1 top-1 h-6 w-6 text-[#f472b6]"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 0L14 9L23 11L14 13L12 22L10 13L1 11L10 9L12 0Z" opacity="0.85" />
        <path d="M20 16L21 19L24 20L21 21L20 24L19 21L16 20L19 19L20 16Z" opacity="0.65" />
      </svg>

      {/* Latar belakang lingkaran gelap bercahaya lembut */}
      <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#521b3a]/50 bg-gradient-to-b from-[#3a1329] to-[#1c0816] shadow-inner shadow-[#5c1a3e]/40">
        {/* Kertas Resi Struk Pink */}
        <div className="relative w-14 rounded-t-xl bg-gradient-to-b from-[#f472b6] to-[#db2777] p-2.5 shadow-md">
          {/* Garis-garis putih di dalam struk */}
          <div className="space-y-1.5 pt-0.5">
            <div className="h-1.5 w-full rounded-full bg-white/90" />
            <div className="h-1.5 w-3/4 rounded-full bg-white/75" />
            <div className="h-1.5 w-4/5 rounded-full bg-white/85" />
          </div>

          {/* Gerigi potongan bawah struk (zig-zag) */}
          <svg
            className="absolute -bottom-2 left-0 w-full text-[#db2777]"
            viewBox="0 0 56 8"
            fill="currentColor"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0 0 L4 8 L8 0 L12 8 L16 0 L20 8 L24 0 L28 8 L32 0 L36 8 L40 0 L44 8 L48 0 L52 8 L56 0 Z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export function RiwayatPage() {
  const transaksi = useTransaksi();
  const kategori = useKategori();
  const sheet = useTransaksiSheet();
  const hapus = useHapusTransaksi();
  const sekarang = Date.now();

  // State navigasi dan filter
  const [periode, setPeriode] = useState<FilterPeriodeId>('hari-ini');
  const [fokus, setFokus] = useState<FokusTransaksi>('semua');
  const [kategoriTerpilih, setKategoriTerpilih] = useState<string | null>(null);
  const [cari, setCari] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');

  // Dropdown kategori di kartu ringkasan
  const [menuKategoriBuka, setMenuKategoriBuka] = useState(false);
  const [panelFilterBuka, setPanelFilterBuka] = useState(false);

  const rentang = useMemo(
    () => hitungRentangWaktu(periode, sekarang, dari, sampai),
    [periode, sekarang, dari, sampai],
  );

  // Transaksi dalam rentang periode
  const transaksiRentang = useMemo(() => {
    return transaksi.filter((t) => {
      if (rentang && (t.waktu < rentang.mulai || t.waktu >= rentang.selesai)) return false;
      return true;
    });
  }, [transaksi, rentang]);

  // Hitung total finansial
  const total = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    let countMasuk = 0;
    let countKeluar = 0;

    for (const t of transaksiRentang) {
      if (t.jenis === 'masuk') {
        masuk += t.nominal;
        countMasuk += 1;
      } else {
        keluar += t.nominal;
        countKeluar += 1;
      }
    }

    return {
      masuk,
      keluar,
      saldo: masuk - keluar,
      countMasuk,
      countKeluar,
      countTotal: transaksiRentang.length,
    };
  }, [transaksiRentang]);

  // Transaksi akhir setelah filter pencarian, fokus (semua/keluar/masuk), dan kategori
  const difilter = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return transaksiRentang.filter((t) => {
      if (fokus !== 'semua' && t.jenis !== fokus) return false;
      if (kategoriTerpilih && (t.kategori || 'Tanpa Kategori') !== kategoriTerpilih) return false;
      if (!kata) return true;
      return (
        t.keterangan.toLowerCase().includes(kata) ||
        (t.kategori?.toLowerCase().includes(kata) ?? false) ||
        String(t.nominal).includes(kata)
      );
    });
  }, [transaksiRentang, fokus, kategoriTerpilih, cari]);

  // Kelompokkan per hari untuk daftar transaksi
  const grupHari = useMemo(() => {
    const hasil: { label: string; items: Transaksi[]; net: number }[] = [];
    for (const t of difilter) {
      const label = labelHariRelatif(t.waktu, sekarang);
      const nilai = t.jenis === 'masuk' ? t.nominal : -t.nominal;
      const terakhir = hasil[hasil.length - 1];
      if (terakhir && terakhir.label === label) {
        terakhir.items.push(t);
        terakhir.net += nilai;
      } else {
        hasil.push({ label, items: [t], net: nilai });
      }
    }
    return hasil;
  }, [difilter, sekarang]);

  const labelPeriode = useMemo(() => {
    switch (periode) {
      case 'hari-ini':
        return 'Hari Ini';
      case 'kemarin':
        return 'Kemarin';
      case 'minggu-ini':
        return 'Minggu Ini';
      case 'bulan-ini':
        return 'Bulan Ini';
      case 'kustom':
        return 'Rentang Kustom';
    }
  }, [periode]);

  return (
    <div className="relative min-h-dvh bg-[#120811] pb-28 text-white">
      {/* Efek kilau latar belakang burgundy mewah seperti di contoh.webp */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-80 w-80 rounded-full bg-[#821842]/30 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-72 -left-20 h-72 w-72 rounded-full bg-[#591132]/25 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-md px-4 pt-safe">
        {/* 1. Header (Riwayat & Tombol Filter) */}
        <header className="flex items-center justify-between pb-3 pt-4">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              Riwayat
            </h1>
            <p className="mt-0.5 text-xs text-[#c49baa]">
              Kelola dan pantau semua transaksi kamu
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPanelFilterBuka((v) => !v)}
            aria-label="Filter kategori dan rentang"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#3e1d34] bg-[#220f1c] text-[#d4a5b8] shadow-sm transition-colors hover:bg-[#2e1426] hover:text-white"
          >
            <Filter size={18} aria-hidden="true" />
          </button>
        </header>

        {/* 2. Kolom Pencarian */}
        <div className="relative mt-2">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8f6477]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari keterangan, kategori, atau nominal..."
            className="w-full rounded-2xl border border-[#341629] bg-[#1d0c18] py-2.5 pl-10 pr-4 text-xs text-white placeholder:text-[#8f6477] focus:border-[#d0346d] focus:outline-none focus:ring-2 focus:ring-[#d0346d]/25 transition-all"
          />
          {cari && (
            <button
              type="button"
              onClick={() => setCari('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8f6477] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 3. Baris Tombol Filter Waktu (Pills Horizontal) */}
        <div className="no-scrollbar -mx-4 mt-3 flex items-center gap-2 overflow-x-auto px-4 pb-1">
          {DAFTAR_PERIODE.map((item) => {
            const aktif = periode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriode(item.id)}
                className={cn(
                  'flex min-h-[2.25rem] shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-semibold transition-all',
                  aktif
                    ? 'bg-[#d0346d] text-white shadow-md shadow-[#d0346d]/30'
                    : 'border border-[#341629] bg-[#1d0c18] text-[#c49baa] hover:bg-[#281122] hover:text-white',
                )}
              >
                {item.denganIkon && <Calendar size={13} aria-hidden="true" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Tanggal Kustom (Jika 'Kustom' dipilih) */}
        {periode === 'kustom' && (
          <div className="mt-2.5 grid grid-cols-2 gap-2 rounded-2xl border border-[#341629] bg-[#1d0c18] p-3 text-xs">
            <div>
              <label className="mb-1 block text-[11px] text-[#8f6477]">Dari Tanggal</label>
              <input
                type="date"
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                className="w-full rounded-xl border border-[#341629] bg-[#140812] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#d0346d]"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] text-[#8f6477]">Sampai Tanggal</label>
              <input
                type="date"
                value={sampai}
                onChange={(e) => setSampai(e.target.value)}
                className="w-full rounded-xl border border-[#341629] bg-[#140812] px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#d0346d]"
              />
            </div>
          </div>
        )}

        {/* 4. Kartu Unggulan Ringkasan (Featured Summary Card) */}
        <div className="relative mt-3.5 overflow-hidden rounded-3xl border border-[#8a224d]/40 bg-gradient-to-br from-[#7a1a44] via-[#541230] to-[#33081c] p-5 text-white shadow-xl">
          {/* Garis-garis gelombang halus seperti di contoh.webp */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
            preserveAspectRatio="none"
            viewBox="0 0 400 200"
            aria-hidden="true"
          >
            <path d="M-40,160 Q120,60 260,130 T520,30" fill="none" stroke="white" strokeWidth="28" />
            <path d="M-40,110 Q140,20 300,90 T520,10" fill="none" stroke="white" strokeWidth="18" />
          </svg>

          {/* Baris Atas Kartu */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-pink-100">
              <Calendar size={14} aria-hidden="true" />
              <span>Ringkasan {labelPeriode}</span>
            </div>

            {/* Dropdown Kategori Pil "Semua ▾" */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuKategoriBuka((v) => !v)}
                className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <span>{kategoriTerpilih || 'Semua'}</span>
                <ChevronDown size={13} aria-hidden="true" />
              </button>

              {menuKategoriBuka && (
                <div className="absolute right-0 top-full z-30 mt-1 max-h-48 w-36 overflow-y-auto rounded-xl border border-white/20 bg-[#250d1d] p-1 shadow-2xl backdrop-blur-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setKategoriTerpilih(null);
                      setMenuKategoriBuka(false);
                    }}
                    className={cn(
                      'w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                      kategoriTerpilih === null ? 'bg-[#d0346d] text-white font-semibold' : 'text-pink-100 hover:bg-white/10',
                    )}
                  >
                    Semua
                  </button>
                  {kategori.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => {
                        setKategoriTerpilih(k.nama);
                        setMenuKategoriBuka(false);
                      }}
                      className={cn(
                        'w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors',
                        kategoriTerpilih === k.nama ? 'bg-[#d0346d] text-white font-semibold' : 'text-pink-100 hover:bg-white/10',
                      )}
                    >
                      {k.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nominal Saldo Utama Besar */}
          <div className="relative z-10 my-3 font-display text-3xl font-extrabold tracking-tight tabular-nums text-white">
            {formatRupiah(total.saldo)}
          </div>

          {/* Baris Bawah: Pemasukan & Pengeluaran 2 Kolom */}
          <div className="relative z-10 grid grid-cols-2 gap-3 border-t border-white/15 pt-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#10b981]/25 text-[#34d399]">
                <ArrowDown size={16} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-pink-100/70">Pemasukan</p>
                <p className="truncate text-sm font-bold text-white tabular-nums">
                  {formatRupiah(total.masuk)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 border-l border-white/15 pl-3">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f43f5e]/25 text-[#fb7185]">
                <ArrowUp size={16} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-pink-100/70">Pengeluaran</p>
                <p className="truncate text-sm font-bold text-white tabular-nums">
                  {formatRupiah(total.keluar)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Tiga Kartu Statistik Mini (Masuk, Keluar, Saldo) */}
        <div className="mt-3.5 grid grid-cols-3 gap-2.5">
          {/* Card 1: Masuk */}
          <button
            type="button"
            onClick={() => setFokus('masuk')}
            className={cn(
              'flex flex-col rounded-2xl border p-3 text-left transition-all',
              fokus === 'masuk'
                ? 'border-[#10b981]/50 bg-[#162920] shadow-sm'
                : 'border-[#341629] bg-[#1d0c18] hover:bg-[#261020]',
            )}
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#10b981]/15 text-[#10b981]">
              <Wallet size={15} aria-hidden="true" />
            </span>
            <span className="mt-2 text-[11px] font-medium text-[#c49baa]">Masuk</span>
            <span className="mt-0.5 truncate text-xs font-bold tabular-nums text-[#34d399]">
              {formatRupiah(total.masuk)}
            </span>
          </button>

          {/* Card 2: Keluar */}
          <button
            type="button"
            onClick={() => setFokus('keluar')}
            className={cn(
              'flex flex-col rounded-2xl border p-3 text-left transition-all',
              fokus === 'keluar'
                ? 'border-[#f43f5e]/50 bg-[#2d121c] shadow-sm'
                : 'border-[#341629] bg-[#1d0c18] hover:bg-[#261020]',
            )}
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#f43f5e]/15 text-[#f43f5e]">
              <Upload size={15} aria-hidden="true" />
            </span>
            <span className="mt-2 text-[11px] font-medium text-[#c49baa]">Keluar</span>
            <span className="mt-0.5 truncate text-xs font-bold tabular-nums text-[#fb7185]">
              {formatRupiah(total.keluar)}
            </span>
          </button>

          {/* Card 3: Saldo */}
          <button
            type="button"
            onClick={() => setFokus('semua')}
            className={cn(
              'flex flex-col rounded-2xl border p-3 text-left transition-all',
              fokus === 'semua'
                ? 'border-[#d0346d]/50 bg-[#2a101f] shadow-sm'
                : 'border-[#341629] bg-[#1d0c18] hover:bg-[#261020]',
            )}
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#d0346d]/15 text-[#d0346d]">
              <Layers size={15} aria-hidden="true" />
            </span>
            <span className="mt-2 text-[11px] font-medium text-[#c49baa]">Saldo</span>
            <span className="mt-0.5 truncate text-xs font-bold tabular-nums text-white">
              {formatRupiah(total.saldo)}
            </span>
          </button>
        </div>

        {/* 6. Tiga Tab Segmentasi Cepat */}
        <div className="mt-3.5 grid grid-cols-3 gap-1 rounded-2xl border border-[#341629] bg-[#1d0c18] p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setFokus('semua');
              setKategoriTerpilih(null);
            }}
            className={cn(
              'flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-xl transition-all',
              fokus === 'semua'
                ? 'bg-white font-bold text-[#190814] shadow-sm'
                : 'text-[#c49baa] hover:text-white',
            )}
          >
            <List size={14} aria-hidden="true" />
            <span>Semua ({total.countTotal})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFokus('keluar');
              setKategoriTerpilih(null);
            }}
            className={cn(
              'flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-xl transition-all',
              fokus === 'keluar'
                ? 'bg-white font-bold text-[#190814] shadow-sm'
                : 'text-[#c49baa] hover:text-[#fb7185]',
            )}
          >
            <ArrowUp size={14} aria-hidden="true" />
            <span>Pengeluaran ({total.countKeluar})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFokus('masuk');
              setKategoriTerpilih(null);
            }}
            className={cn(
              'flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-xl transition-all',
              fokus === 'masuk'
                ? 'bg-white font-bold text-[#190814] shadow-sm'
                : 'text-[#c49baa] hover:text-[#34d399]',
            )}
          >
            <ArrowDown size={14} aria-hidden="true" />
            <span>Pemasukan ({total.countMasuk})</span>
          </button>
        </div>

        {/* Panel Filter Kategori Tambahan (Bisa dibuka lewat tombol filter atas) */}
        {panelFilterBuka && (
          <div className="mt-3 rounded-2xl border border-[#3e1d34] bg-[#1d0c18] p-3 text-xs">
            <div className="mb-2 flex items-center justify-between text-[#c49baa]">
              <span className="font-semibold">Filter Berdasarkan Kategori</span>
              {kategoriTerpilih && (
                <button
                  type="button"
                  onClick={() => setKategoriTerpilih(null)}
                  className="text-xs text-[#d0346d] underline"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setKategoriTerpilih(null)}
                className={cn(
                  'min-h-[2rem] rounded-full px-3 py-1 font-medium transition-colors',
                  kategoriTerpilih === null
                    ? 'bg-[#d0346d] text-white font-semibold'
                    : 'border border-[#341629] bg-[#140812] text-[#c49baa]',
                )}
              >
                Semua Kategori
              </button>
              {kategori.map((k) => {
                const aktif = kategoriTerpilih === k.nama;
                return (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKategoriTerpilih(aktif ? null : k.nama)}
                    className={cn(
                      'min-h-[2rem] rounded-full px-3 py-1 font-medium transition-colors',
                      aktif
                        ? 'bg-[#d0346d] text-white font-semibold'
                        : 'border border-[#341629] bg-[#140812] text-[#c49baa]',
                    )}
                  >
                    {k.nama}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Konten: Status Kosong ATAU Daftar Transaksi */}
        <div className="mt-6">
          {difilter.length === 0 ? (
            /* Tampilan Kosong Persis contoh.webp */
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <IlustrasiResiStruk />
              <h2 className="mt-4 font-display text-lg font-bold text-white">
                Riwayat masih kosong
              </h2>
              <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-[#a87d90]">
                Semua transaksi yang kamu catat tersimpan di sini dan bisa difilter per hari, minggu, atau bulan.
              </p>
              <button
                type="button"
                onClick={() => sheet.tambah()}
                className="mt-4 flex min-h-[2.75rem] items-center gap-1.5 rounded-full bg-[#d0346d] px-6 text-xs font-semibold text-white shadow-lg shadow-[#d0346d]/30 transition-transform active:scale-95 hover:bg-[#b5285b]"
              >
                <Plus size={16} aria-hidden="true" />
                <span>Catat Transaksi</span>
              </button>
            </div>
          ) : (
            /* Daftar Transaksi jika ada data */
            <div className="space-y-4">
              {grupHari.map((grup) => (
                <section key={grup.label} aria-label={grup.label}>
                  <div className="mb-2 flex items-baseline justify-between px-1">
                    <h3 className="text-xs font-semibold text-[#c49baa]">{grup.label}</h3>
                    <span className="text-xs font-medium tabular-nums text-[#8f6477]">
                      {formatRupiah(grup.net)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {grup.items.map((t) => {
                      const masuk = t.jenis === 'masuk';
                      const judul = t.keterangan.trim() || (masuk ? 'Pemasukan' : 'Pengeluaran');
                      return (
                        <SwipeRow
                          key={t.id}
                          onBuka={() => sheet.edit(t)}
                          onHapus={() => void hapus(t)}
                          labelHapus={`Hapus ${judul}`}
                        >
                          <div className="flex items-center gap-3 rounded-2xl border border-[#341629] bg-[#1d0c18] px-4 py-3 transition-colors hover:bg-[#251020]">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white">{judul}</p>
                              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#8f6477]">
                                <span className="tabular-nums">{formatJam(t.waktu)}</span>
                                {t.kategori && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="truncate text-[#c49baa]">{t.kategori}</span>
                                  </>
                                )}
                              </p>
                            </div>
                            <span
                              className={cn(
                                'shrink-0 text-sm font-bold tabular-nums',
                                masuk ? 'text-[#34d399]' : 'text-[#fb7185]',
                              )}
                            >
                              {masuk ? '+' : '-'}
                              {formatRupiah(t.nominal)}
                            </span>
                          </div>
                        </SwipeRow>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 8. Tombol Melayang Tambah Transaksi (FAB) di kanan bawah persis contoh.webp */}
      <button
        type="button"
        onClick={() => sheet.tambah()}
        aria-label="Catat transaksi baru"
        className="fixed bottom-[calc(5rem_+_env(safe-area-inset-bottom))] right-4 z-30 grid h-14 w-14 place-items-center rounded-full bg-[#d0346d] text-white shadow-xl shadow-[#d0346d]/40 transition-transform active:scale-95 hover:bg-[#b5285b]"
      >
        <Plus size={26} strokeWidth={2.5} aria-hidden="true" />
      </button>

      {/* Lembar Dialog Form Transaksi */}
      <TransaksiSheet
        buka={sheet.buka}
        transaksi={sheet.transaksi}
        jenisDefault={sheet.jenisDefault}
        kategori={kategori}
        onTutup={sheet.tutup}
      />
    </div>
  );
}

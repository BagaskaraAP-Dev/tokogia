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
 * Meniru persis medali lingkaran burgundy dengan kertas struk bergelombang dan kilauan sinar di contoh.webp
 */
function IlustrasiResiStruk() {
  return (
    <div className="relative mx-auto mt-2 flex h-28 w-28 items-center justify-center">
      {/* 3 kilauan sinar di kanan atas persis contoh.webp (\ | /) */}
      <svg
        className="absolute -right-0.5 top-1 h-5 w-5 text-white/90"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <line x1="12" y1="5" x2="12" y2="1" />
        <line x1="18" y1="8" x2="22" y2="4" />
        <line x1="6" y1="8" x2="2" y2="4" />
      </svg>

      {/* Latar belakang medali lingkaran burgundy gelap */}
      <div className="flex h-28 w-28 items-center justify-center rounded-full border border-[#441834] bg-gradient-to-b from-[#2e1022] to-[#150711] shadow-inner shadow-[#52193d]/30">
        {/* Kertas Resi Struk Pink Halus */}
        <div className="relative h-[68px] w-14 overflow-hidden rounded-t-xl bg-gradient-to-b from-[#f472b6] to-[#db2777] p-2.5 pb-4 shadow-md">
          {/* Garis-garis putih rounded di dalam struk */}
          <div className="space-y-1.5 pt-1">
            <div className="h-1.5 w-full rounded-full bg-white/95" />
            <div className="h-1.5 w-3/4 rounded-full bg-white/80" />
            <div className="h-1.5 w-5/6 rounded-full bg-white/90" />
          </div>

          {/* Gerigi lekukan lembut bawah struk (scalloped rippled bottom) */}
          <svg
            className="absolute -bottom-0.5 left-0 w-full text-[#db2777]"
            viewBox="0 0 56 6"
            fill="currentColor"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M0,0 Q5.6,6 11.2,0 Q16.8,6 22.4,0 Q28,6 33.6,0 Q39.2,6 44.8,0 Q50.4,6 56,0 L56,6 L0,6 Z" />
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
    <div className="relative min-h-dvh bg-[#120811] pb-24 text-white">
      {/* Efek kilau latar belakang burgundy mewah di sudut kanan atas seperti di contoh.webp */}
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-72 w-72 rounded-full bg-[#821842]/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto w-full max-w-md px-4 pt-safe">
        {/* 1. Header (Riwayat & Tombol Filter) */}
        <header className="flex items-center justify-between pb-1 pt-2.5">
          <div>
            <h1 className="font-sans text-[22px] font-bold tracking-tight text-white">
              Riwayat
            </h1>
            <p className="mt-0.5 font-sans text-xs text-[#a07a8c]">
              Kelola dan pantau semua transaksi kamu
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPanelFilterBuka((v) => !v)}
            aria-label="Filter kategori dan rentang"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl border border-[#351528] bg-[#1a0a16] text-[#b88fa3] shadow-sm transition-colors hover:text-white active:scale-95"
          >
            <Filter size={17} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </header>

        {/* 2. Kolom Pencarian */}
        <div className="relative mt-2">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7d536a]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari keterangan, kategori, atau nominal..."
            className="w-full rounded-2xl border border-[#301325] bg-[#1a0a16] py-2 pl-9 pr-4 font-sans text-xs text-white placeholder:text-[#7d536a] transition-all focus:border-[#db2777] focus:outline-none"
          />
          {cari && (
            <button
              type="button"
              onClick={() => setCari('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7d536a] hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* 3. Baris Tombol Filter Waktu (Pills Horizontal) */}
        <div className="no-scrollbar -mx-4 mt-2.5 flex items-center gap-1.5 overflow-x-auto px-4 pb-0.5">
          {DAFTAR_PERIODE.map((item) => {
            const aktif = periode === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPeriode(item.id)}
                className={cn(
                  'flex shrink-0 items-center justify-center gap-1 rounded-full px-3.5 py-1 text-[11px] font-semibold transition-all',
                  aktif
                    ? 'bg-[#db2777] text-white shadow-md shadow-pink-950/60'
                    : 'border border-[#301325] bg-[#1a0a16] text-[#b88fa3] hover:text-white',
                )}
              >
                {item.denganIkon && <Calendar size={12} aria-hidden="true" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Input Tanggal Kustom (Jika 'Kustom' dipilih) */}
        {periode === 'kustom' && (
          <div className="mt-2 grid grid-cols-2 gap-2 rounded-2xl border border-[#301325] bg-[#1a0a16] p-2.5 text-xs">
            <div>
              <label className="mb-1 block text-[10px] text-[#7d536a]">Dari Tanggal</label>
              <input
                type="date"
                value={dari}
                onChange={(e) => setDari(e.target.value)}
                className="w-full rounded-xl border border-[#301325] bg-[#120811] px-2 py-1 text-xs text-white focus:border-[#db2777] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-[#7d536a]">Sampai Tanggal</label>
              <input
                type="date"
                value={sampai}
                onChange={(e) => setSampai(e.target.value)}
                className="w-full rounded-xl border border-[#301325] bg-[#120811] px-2 py-1 text-xs text-white focus:border-[#db2777] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* 4. Kartu Unggulan Ringkasan (Featured Summary Card) */}
        <div className="relative mt-2.5 overflow-hidden rounded-3xl border border-[#5c1637]/50 bg-gradient-to-br from-[#68183c] via-[#48112b] to-[#250817] p-4 text-white shadow-xl shadow-pink-950/40">
          {/* Garis-garis gelombang halus seperti di contoh.webp */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
            preserveAspectRatio="none"
            viewBox="0 0 400 200"
            aria-hidden="true"
          >
            <path
              d="M-20,130 C90,60 180,160 420,50 L420,200 L-20,200 Z"
              fill="white"
              opacity="0.35"
            />
            <path
              d="M-20,90 C100,160 210,30 420,110"
              fill="none"
              stroke="white"
              strokeWidth="18"
              opacity="0.45"
            />
          </svg>

          {/* Baris Atas Kartu */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-medium text-pink-100/90">
              <Calendar size={13} aria-hidden="true" />
              <span>Ringkasan {labelPeriode}</span>
            </div>

            {/* Dropdown Kategori Pil "Semua ▾" */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuKategoriBuka((v) => !v)}
                className="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                <span>{kategoriTerpilih || 'Semua'}</span>
                <ChevronDown size={12} aria-hidden="true" />
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
                      'w-full rounded-lg px-2.5 py-1 text-left text-xs transition-colors',
                      kategoriTerpilih === null ? 'bg-[#db2777] text-white font-semibold' : 'text-pink-100 hover:bg-white/10',
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
                        'w-full rounded-lg px-2.5 py-1 text-left text-xs transition-colors',
                        kategoriTerpilih === k.nama ? 'bg-[#db2777] text-white font-semibold' : 'text-pink-100 hover:bg-white/10',
                      )}
                    >
                      {k.nama}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nominal Saldo Utama Besar (Font Sans Bold Modern Sesuai contoh.webp) */}
          <div className="relative z-10 my-2 font-sans text-[28px] font-extrabold tracking-tight tabular-nums text-white">
            {formatRupiah(total.saldo)}
          </div>

          {/* Baris Bawah: Pemasukan & Pengeluaran 2 Kolom */}
          <div className="relative z-10 grid grid-cols-2 gap-2 border-t border-white/10 pt-2.5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#236b4e]/50 bg-[#143d2c]/80 text-[#34d399]">
                <ArrowDown size={14} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-pink-100/70">Pemasukan</p>
                <p className="truncate text-xs font-bold tabular-nums text-white">
                  {formatRupiah(total.masuk)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-l border-white/10 pl-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[#78233e]/50 bg-[#481424]/80 text-[#fb7185]">
                <ArrowUp size={14} strokeWidth={2.5} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-pink-100/70">Pengeluaran</p>
                <p className="truncate text-xs font-bold tabular-nums text-white">
                  {formatRupiah(total.keluar)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Tiga Kartu Statistik Mini (Masuk, Keluar, Saldo) */}
        <div className="mt-2.5 grid grid-cols-3 gap-2">
          {/* Card 1: Masuk */}
          <button
            type="button"
            onClick={() => setFokus('masuk')}
            className={cn(
              'flex flex-col rounded-2xl border p-2.5 text-left transition-all',
              fokus === 'masuk'
                ? 'border-[#10b981]/60 bg-[#132b20] shadow-sm'
                : 'border-[#301325] bg-[#180a15] hover:bg-[#200d1c]',
            )}
          >
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#143324] text-[#34d399]">
              <Wallet size={14} aria-hidden="true" />
            </span>
            <span className="mt-1.5 text-[10px] font-medium text-[#9c758a]">Masuk</span>
            <span className="mt-0.5 truncate text-[11px] font-bold tabular-nums text-[#34d399]">
              {formatRupiah(total.masuk)}
            </span>
          </button>

          {/* Card 2: Keluar */}
          <button
            type="button"
            onClick={() => setFokus('keluar')}
            className={cn(
              'flex flex-col rounded-2xl border p-2.5 text-left transition-all',
              fokus === 'keluar'
                ? 'border-[#f43f5e]/60 bg-[#2d121c] shadow-sm'
                : 'border-[#301325] bg-[#180a15] hover:bg-[#200d1c]',
            )}
          >
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#3d1523] text-[#fb7185]">
              <Upload size={14} aria-hidden="true" />
            </span>
            <span className="mt-1.5 text-[10px] font-medium text-[#9c758a]">Keluar</span>
            <span className="mt-0.5 truncate text-[11px] font-bold tabular-nums text-[#fb7185]">
              {formatRupiah(total.keluar)}
            </span>
          </button>

          {/* Card 3: Saldo */}
          <button
            type="button"
            onClick={() => setFokus('semua')}
            className={cn(
              'flex flex-col rounded-2xl border p-2.5 text-left transition-all',
              fokus === 'semua'
                ? 'border-[#db2777]/60 bg-[#2b1020] shadow-sm'
                : 'border-[#301325] bg-[#180a15] hover:bg-[#200d1c]',
            )}
          >
            <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#3d122e] text-[#f472b6]">
              <Layers size={14} aria-hidden="true" />
            </span>
            <span className="mt-1.5 text-[10px] font-medium text-[#9c758a]">Saldo</span>
            <span className="mt-0.5 truncate text-[11px] font-bold tabular-nums text-white">
              {formatRupiah(total.saldo)}
            </span>
          </button>
        </div>

        {/* 6. Tiga Tab Segmentasi Cepat (1 Baris Rapi) */}
        <div className="mt-2.5 grid grid-cols-3 gap-1 rounded-2xl border border-[#2e1224] bg-[#140812] p-1 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => {
              setFokus('semua');
              setKategoriTerpilih(null);
            }}
            className={cn(
              'flex min-h-[2.25rem] items-center justify-center gap-1 rounded-xl px-1 tracking-tight transition-all',
              fokus === 'semua'
                ? 'bg-[#eedae5] font-bold text-[#1b0816] shadow-sm'
                : 'text-[#9c758a] hover:text-white',
            )}
          >
            <List size={13} strokeWidth={2.5} aria-hidden="true" />
            <span className="truncate">Semua ({total.countTotal})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFokus('keluar');
              setKategoriTerpilih(null);
            }}
            className={cn(
              'flex min-h-[2.25rem] items-center justify-center gap-1 rounded-xl px-1 tracking-tight transition-all',
              fokus === 'keluar'
                ? 'bg-[#eedae5] font-bold text-[#1b0816] shadow-sm'
                : 'text-[#9c758a] hover:text-[#fb7185]',
            )}
          >
            <ArrowUp size={13} strokeWidth={2} aria-hidden="true" />
            <span className="truncate">Pengeluaran ({total.countKeluar})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setFokus('masuk');
              setKategoriTerpilih(null);
            }}
            className={cn(
              'flex min-h-[2.25rem] items-center justify-center gap-1 rounded-xl px-1 tracking-tight transition-all',
              fokus === 'masuk'
                ? 'bg-[#eedae5] font-bold text-[#1b0816] shadow-sm'
                : 'text-[#9c758a] hover:text-[#34d399]',
            )}
          >
            <ArrowDown size={13} strokeWidth={2} aria-hidden="true" />
            <span className="truncate">Pemasukan ({total.countMasuk})</span>
          </button>
        </div>

        {/* Panel Filter Kategori Tambahan (Bisa dibuka lewat tombol filter atas) */}
        {panelFilterBuka && (
          <div className="mt-2.5 rounded-2xl border border-[#351528] bg-[#1a0a16] p-2.5 text-xs">
            <div className="mb-2 flex items-center justify-between text-[#b88fa3]">
              <span className="font-semibold">Filter Berdasarkan Kategori</span>
              {kategoriTerpilih && (
                <button
                  type="button"
                  onClick={() => setKategoriTerpilih(null)}
                  className="text-xs text-[#db2777] underline"
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
                  'min-h-[1.75rem] rounded-full px-3 py-0.5 text-xs font-medium transition-colors',
                  kategoriTerpilih === null
                    ? 'bg-[#db2777] text-white font-semibold'
                    : 'border border-[#301325] bg-[#120811] text-[#b88fa3]',
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
                      'min-h-[1.75rem] rounded-full px-3 py-0.5 text-xs font-medium transition-colors',
                      aktif
                        ? 'bg-[#db2777] text-white font-semibold'
                        : 'border border-[#301325] bg-[#120811] text-[#b88fa3]',
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
        <div className="mt-3">
          {difilter.length === 0 ? (
            /* Tampilan Kosong Persis contoh.webp */
            <div className="flex flex-col items-center justify-center text-center">
              <IlustrasiResiStruk />
              <h2 className="mt-2.5 font-sans text-[15px] font-bold text-white">
                Riwayat masih kosong
              </h2>
              <p className="mt-0.5 max-w-[250px] font-sans text-[11px] leading-relaxed text-[#9c758a]">
                Semua transaksi yang kamu catat tersimpan di sini dan bisa difilter per hari, minggu, atau bulan.
              </p>
              <button
                type="button"
                onClick={() => sheet.tambah()}
                className="mt-3 flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#d0246a] to-[#a3154e] px-5 py-2 font-sans text-xs font-semibold text-white shadow-lg shadow-pink-950/70 transition-transform active:scale-95 hover:brightness-110"
              >
                <Plus size={15} strokeWidth={2.5} aria-hidden="true" />
                <span>Catat Transaksi</span>
              </button>
            </div>
          ) : (
            /* Daftar Transaksi jika ada data */
            <div className="space-y-3">
              {grupHari.map((grup) => (
                <section key={grup.label} aria-label={grup.label}>
                  <div className="mb-1.5 flex items-baseline justify-between px-1">
                    <h3 className="text-xs font-semibold text-[#b88fa3]">{grup.label}</h3>
                    <span className="text-xs font-medium tabular-nums text-[#7d536a]">
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
                          <div className="flex items-center gap-3 rounded-2xl border border-[#301325] bg-[#1a0a16] px-4 py-2.5 transition-colors hover:bg-[#220e1f]">
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white">{judul}</p>
                              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#7d536a]">
                                <span className="tabular-nums">{formatJam(t.waktu)}</span>
                                {t.kategori && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="truncate text-[#b88fa3]">{t.kategori}</span>
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
        className="fixed bottom-[calc(4.5rem_+_env(safe-area-inset-bottom))] right-4 z-30 grid h-13 w-13 place-items-center rounded-full bg-gradient-to-br from-[#e11d68] to-[#b31454] text-white shadow-xl shadow-pink-950/80 transition-transform hover:scale-105 active:scale-95"
      >
        <Plus size={24} strokeWidth={2.5} aria-hidden="true" />
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

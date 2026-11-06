import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { ReceiptIllustration } from '../components/illustrations/Pastry';
import { RingkasanBar } from '../components/finance/RingkasanBar';
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
    case 'rentang':
      if (!dari || !sampai) return null;
      return { mulai: awalHariDariInputTanggal(dari), selesai: awalHariDariInputTanggal(sampai) + HARI_MS };
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

  const [filter, setFilter] = useState<FilterId>('bulan-ini');
  const [cari, setCari] = useState('');
  const [dari, setDari] = useState('');
  const [sampai, setSampai] = useState('');

  const rentang = useMemo(
    () => hitungRentang(filter, sekarang, dari, sampai),
    [filter, sekarang, dari, sampai],
  );

  const difilter = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return transaksi.filter((t) => {
      if (rentang && (t.waktu < rentang.mulai || t.waktu >= rentang.selesai)) return false;
      if (!kata) return true;
      return (
        t.keterangan.toLowerCase().includes(kata) ||
        (t.kategori?.toLowerCase().includes(kata) ?? false)
      );
    });
  }, [transaksi, rentang, cari]);

  const total = useMemo(() => {
    let masuk = 0;
    let keluar = 0;
    for (const t of difilter) {
      if (t.jenis === 'masuk') masuk += t.nominal;
      else keluar += t.nominal;
    }
    return { masuk, keluar, saldo: masuk - keluar };
  }, [difilter]);

  const inputTanggal =
    'min-h-[2.75rem] flex-1 rounded-xl border border-line bg-card px-3 text-base text-ink focus:border-brand-deep focus:outline-none';

  return (
    <>
      <PageHeader title="Riwayat" />

      <div className="mx-auto w-full max-w-md px-4 py-4">
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
            placeholder="Cari keterangan atau kategori"
            className="min-h-[2.75rem] w-full rounded-xl border border-line bg-card pl-10 pr-3 text-base text-ink placeholder:text-ink-soft/70 focus:border-brand-deep focus:outline-none"
          />
        </label>

        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
          {FILTER.map((f) => {
            const aktif = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={aktif}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'min-h-[2.5rem] shrink-0 rounded-full px-4 text-sm font-semibold transition-colors',
                  aktif ? 'bg-brand-deep text-on-brand' : 'bg-softer text-ink',
                )}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {filter === 'rentang' && (
          <div className="mb-4 flex items-center gap-2">
            <input
              type="date"
              aria-label="Dari tanggal"
              value={dari}
              max={sampai || undefined}
              onChange={(e) => setDari(e.target.value)}
              className={inputTanggal}
            />
            <span className="text-sm text-ink-soft">sampai</span>
            <input
              type="date"
              aria-label="Sampai tanggal"
              value={sampai}
              min={dari || undefined}
              onChange={(e) => setSampai(e.target.value)}
              className={inputTanggal}
            />
          </div>
        )}

        <div className="mb-4">
          <RingkasanBar masuk={total.masuk} keluar={total.keluar} saldo={total.saldo} />
        </div>

        {transaksi.length === 0 ? (
          <EmptyState
            illustration={<ReceiptIllustration className="h-full w-full" />}
            title="Riwayat masih kosong"
            hint="Semua transaksi yang kamu catat tersimpan di sini dan bisa difilter per hari, minggu, atau bulan."
          />
        ) : difilter.length === 0 ? (
          <EmptyState
            illustration={<ReceiptIllustration className="h-full w-full" />}
            title="Tidak ada transaksi"
            hint="Coba ganti filter atau kata pencarian untuk melihat catatan yang lain."
          />
        ) : (
          <DayGroupedList
            transaksi={difilter}
            sekarang={sekarang}
            onBuka={sheet.edit}
            onHapus={(t: Transaksi) => void hapus(t)}
          />
        )}
      </div>

      <Fab onClick={sheet.tambah} label="Catat transaksi" />
      <TransaksiSheet
        buka={sheet.buka}
        transaksi={sheet.transaksi}
        kategori={kategori}
        onTutup={sheet.tutup}
      />
    </>
  );
}

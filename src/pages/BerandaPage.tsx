import { Logo } from '../components/ui/Logo';
import { EmptyState } from '../components/ui/EmptyState';
import { CupcakeIllustration } from '../components/illustrations/Pastry';
import { Fab } from '../components/finance/Fab';
import { SummaryCarousel } from '../components/finance/SummaryCarousel';
import { WeeklyBars } from '../components/finance/WeeklyBars';
import { DayGroupedList } from '../components/finance/DayGroupedList';
import { TransaksiSheet } from '../components/finance/TransaksiSheet';
import { useKategori, useTransaksi } from '../hooks/useData';
import { useTransaksiSheet } from '../hooks/useTransaksiSheet';
import { useHapusTransaksi } from '../hooks/useHapusTransaksi';
import { pemasukan7Hari } from '../utils/summary';

export function BerandaPage() {
  const transaksi = useTransaksi();
  const kategori = useKategori();
  const sheet = useTransaksiSheet();
  const hapus = useHapusTransaksi();
  const sekarang = Date.now();

  const tanggal = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(sekarang));

  const terbaru = transaksi.slice(0, 40);

  return (
    <>
      <header className="grad-brand pt-safe text-white">
        <div className="mx-auto w-full max-w-md px-4 pb-6 pt-4">
          <Logo />
          <p className="mt-4 text-sm text-white">{tanggal}</p>
        </div>
      </header>

      {transaksi.length === 0 ? (
        <EmptyState
          illustration={<CupcakeIllustration className="h-full w-full" />}
          title="Belum ada catatan hari ini"
          hint="Ketuk tombol tambah di kanan bawah untuk mencatat pemasukan atau pengeluaran pertama."
        />
      ) : (
        <div className="mx-auto w-full max-w-md space-y-5 px-4 py-5">
          <SummaryCarousel transaksi={transaksi} sekarang={sekarang} />
          <WeeklyBars data={pemasukan7Hari(transaksi, sekarang)} />
          <section>
            <h2 className="mb-3 px-1 font-display text-lg font-semibold text-ink">Transaksi terbaru</h2>
            <DayGroupedList
              transaksi={terbaru}
              sekarang={sekarang}
              onBuka={sheet.edit}
              onHapus={(t) => void hapus(t)}
            />
          </section>
        </div>
      )}

      <Fab onClick={sheet.tambah} label="Catat transaksi" />
      <TransaksiSheet
        buka={sheet.buka}
        transaksi={sheet.transaksi}
        jenisDefault={sheet.jenisDefault}
        kategori={kategori}
        onTutup={sheet.tutup}
      />
    </>
  );
}

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatRupiah } from '../../utils/currency';
import { useCountUp } from '../../hooks/useCountUp';
import { ringkasanBeranda, type Perubahan, type Ringkasan } from '../../utils/summary';
import type { Transaksi } from '../../types';

interface KartuData {
  judul: string;
  r: Ringkasan;
  tren?: Perubahan;
  trenLabel?: string;
  hero?: boolean;
}

function TrendBadge({ tren, hero }: { tren: Perubahan; hero: boolean }) {
  let Icon = Minus;
  let teks = 'Tetap';
  let warna = 'text-ink-soft';
  if (tren.arah === 'baru') {
    Icon = ArrowUp;
    teks = 'Baru';
    warna = 'text-income-ink';
  } else if (tren.arah === 'naik') {
    Icon = ArrowUp;
    teks = `${tren.persen}%`;
    warna = 'text-income-ink';
  } else if (tren.arah === 'turun') {
    Icon = ArrowDown;
    teks = `${Math.abs(tren.persen ?? 0)}%`;
    warna = 'text-expense-ink';
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold',
        hero ? 'bg-white' : 'bg-softer',
        warna,
      )}
    >
      <Icon size={13} aria-hidden="true" />
      {teks}
    </span>
  );
}

function SummaryCard({ judul, r, tren, trenLabel, hero = false }: KartuData) {
  const saldo = useCountUp(r.saldo);
  return (
    <article
      className={cn(
        'flex w-[82%] shrink-0 snap-start flex-col rounded-3xl p-4',
        hero ? 'grad-brand text-white' : 'bg-card text-ink shadow-card',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className={cn('text-sm font-semibold', hero ? 'text-white' : 'text-ink-soft')}>{judul}</h3>
        {tren && <TrendBadge tren={tren} hero={hero} />}
      </div>

      <p className={cn('mt-2 font-display text-2xl font-bold tabular-nums', hero ? 'text-white' : 'text-ink')}>
        {formatRupiah(saldo)}
      </p>
      {tren && trenLabel && (
        <p className={cn('mt-0.5 text-xs', hero ? 'text-white' : 'text-ink-soft')}>{trenLabel}</p>
      )}

      <div className="mt-4 flex gap-5">
        <div className="min-w-0">
          <p className={cn('text-xs', hero ? 'text-white' : 'text-ink-soft')}>Masuk</p>
          <p
            className={cn(
              'truncate text-sm font-semibold tabular-nums',
              hero ? 'text-white' : 'text-income-ink',
            )}
          >
            {formatRupiah(r.masuk)}
          </p>
        </div>
        <div className="min-w-0">
          <p className={cn('text-xs', hero ? 'text-white' : 'text-ink-soft')}>Keluar</p>
          <p
            className={cn(
              'truncate text-sm font-semibold tabular-nums',
              hero ? 'text-white' : 'text-expense-ink',
            )}
          >
            {formatRupiah(r.keluar)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function SummaryCarousel({ transaksi, sekarang }: { transaksi: Transaksi[]; sekarang: number }) {
  const rb = ringkasanBeranda(transaksi, sekarang);
  const kartu: KartuData[] = [
    { judul: 'Hari ini', r: rb.hariIni, tren: rb.trenHarian, trenLabel: 'pemasukan vs kemarin', hero: true },
    { judul: 'Kemarin', r: rb.kemarin },
    { judul: 'Bulan ini', r: rb.bulanIni, tren: rb.trenBulanan, trenLabel: 'pemasukan vs bulan lalu' },
    { judul: 'Bulan lalu', r: rb.bulanLalu },
  ];

  return (
    <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
      {kartu.map((k) => (
        <SummaryCard key={k.judul} {...k} />
      ))}
    </div>
  );
}

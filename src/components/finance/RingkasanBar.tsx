import { formatRupiah } from '../../utils/currency';
import { cn } from '../../utils/cn';

export type FokusTransaksi = 'semua' | 'keluar' | 'masuk';

function StatButton({
  label,
  nilai,
  warna,
  aktif,
  onClick,
}: {
  label: string;
  nilai: number;
  warna: string;
  aktif?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-w-0 rounded-xl p-2 text-left transition-all',
        aktif
          ? 'bg-softer ring-2 ring-brand-deep/30 shadow-sm'
          : 'hover:bg-softer/60 focus-visible:ring-2 focus-visible:ring-brand-deep',
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-ink-soft">{label}</p>
        {aktif && <span className="h-1.5 w-1.5 rounded-full bg-brand-deep" aria-hidden="true" />}
      </div>
      <p className={cn('mt-0.5 truncate text-sm font-bold tabular-nums', warna)}>
        {formatRupiah(nilai)}
      </p>
    </button>
  );
}

export function RingkasanBar({
  masuk,
  keluar,
  saldo,
  fokus = 'semua',
  onPilihFokus,
}: {
  masuk: number;
  keluar: number;
  saldo: number;
  fokus?: FokusTransaksi;
  onPilihFokus?: (fokus: FokusTransaksi) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 rounded-2xl bg-card p-2.5 shadow-card">
      <StatButton
        label="Masuk"
        nilai={masuk}
        warna="text-income-ink"
        aktif={fokus === 'masuk'}
        onClick={() => onPilihFokus?.('masuk')}
      />
      <StatButton
        label="Keluar"
        nilai={keluar}
        warna="text-expense-ink"
        aktif={fokus === 'keluar'}
        onClick={() => onPilihFokus?.('keluar')}
      />
      <StatButton
        label="Saldo"
        nilai={saldo}
        warna={saldo < 0 ? 'text-expense-ink' : 'text-ink'}
        aktif={fokus === 'semua'}
        onClick={() => onPilihFokus?.('semua')}
      />
    </div>
  );
}

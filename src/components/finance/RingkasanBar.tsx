import { formatRupiah } from '../../utils/currency';
import { cn } from '../../utils/cn';

function Stat({ label, nilai, warna }: { label: string; nilai: number; warna: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-ink-soft">{label}</p>
      <p className={cn('mt-0.5 truncate text-sm font-bold tabular-nums', warna)}>{formatRupiah(nilai)}</p>
    </div>
  );
}

export function RingkasanBar({
  masuk,
  keluar,
  saldo,
}: {
  masuk: number;
  keluar: number;
  saldo: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 rounded-2xl bg-card p-4 shadow-card">
      <Stat label="Masuk" nilai={masuk} warna="text-income-ink" />
      <Stat label="Keluar" nilai={keluar} warna="text-expense-ink" />
      <Stat label="Saldo" nilai={saldo} warna={saldo < 0 ? 'text-expense-ink' : 'text-ink'} />
    </div>
  );
}

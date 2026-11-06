import { cn } from '../../utils/cn';
import { formatJam } from '../../utils/date';
import { formatRupiah } from '../../utils/currency';
import type { Transaksi } from '../../types';
import { SwipeRow } from './SwipeRow';

export function TransactionRow({
  transaksi,
  onBuka,
  onHapus,
}: {
  transaksi: Transaksi;
  onBuka: () => void;
  onHapus: () => void;
}) {
  const masuk = transaksi.jenis === 'masuk';
  const judul = transaksi.keterangan.trim() || (masuk ? 'Pemasukan' : 'Pengeluaran');

  return (
    <SwipeRow onBuka={onBuka} onHapus={onHapus} labelHapus={`Hapus ${judul}`}>
      <div className="flex items-center gap-3 bg-card px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{judul}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-soft">
            <span className="tabular-nums">{formatJam(transaksi.waktu)}</span>
            {transaksi.kategori && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate">{transaksi.kategori}</span>
              </>
            )}
          </p>
        </div>
        <span
          className={cn(
            'shrink-0 font-semibold tabular-nums',
            masuk ? 'text-income-ink' : 'text-expense-ink',
          )}
        >
          {masuk ? '+' : '-'}
          {formatRupiah(transaksi.nominal)}
        </span>
      </div>
    </SwipeRow>
  );
}

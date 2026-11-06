import { labelHariRelatif } from '../../utils/date';
import { formatRupiah } from '../../utils/currency';
import type { Transaksi } from '../../types';
import { TransactionRow } from './TransactionRow';

interface Grup {
  label: string;
  items: Transaksi[];
  net: number;
}

function kelompokkan(transaksi: Transaksi[], sekarang: number): Grup[] {
  const grup: Grup[] = [];
  for (const t of transaksi) {
    const label = labelHariRelatif(t.waktu, sekarang);
    const nilai = t.jenis === 'masuk' ? t.nominal : -t.nominal;
    const terakhir = grup[grup.length - 1];
    if (terakhir && terakhir.label === label) {
      terakhir.items.push(t);
      terakhir.net += nilai;
    } else {
      grup.push({ label, items: [t], net: nilai });
    }
  }
  return grup;
}

export function DayGroupedList({
  transaksi,
  sekarang,
  onBuka,
  onHapus,
}: {
  transaksi: Transaksi[];
  sekarang: number;
  onBuka: (transaksi: Transaksi) => void;
  onHapus: (transaksi: Transaksi) => void;
}) {
  const grup = kelompokkan(transaksi, sekarang);

  return (
    <div className="space-y-5">
      {grup.map((g) => (
        <section key={g.label} aria-label={g.label}>
          <div className="mb-2 flex items-baseline justify-between px-1">
            <h3 className="text-sm font-semibold text-ink-soft">{g.label}</h3>
            <span className="text-xs tabular-nums text-ink-soft">{formatRupiah(g.net)}</span>
          </div>
          <div className="space-y-2">
            {g.items.map((t) => (
              <TransactionRow
                key={t.id}
                transaksi={t}
                onBuka={() => onBuka(t)}
                onHapus={() => onHapus(t)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

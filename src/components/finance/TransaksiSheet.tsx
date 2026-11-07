import { BottomSheet } from '../ui/BottomSheet';
import { TransactionForm } from './TransactionForm';
import type { Kategori, Transaksi } from '../../types';

export function TransaksiSheet({
  buka,
  transaksi,
  jenisDefault,
  kategori,
  onTutup,
}: {
  buka: boolean;
  transaksi: Transaksi | null;
  jenisDefault?: 'masuk' | 'keluar';
  kategori: Kategori[];
  onTutup: () => void;
}) {
  return (
    <BottomSheet open={buka} onClose={onTutup} title={transaksi ? 'Edit transaksi' : 'Catat transaksi'}>
      <TransactionForm
        key={transaksi?.id ?? `baru-${jenisDefault ?? 'masuk'}`}
        transaksi={transaksi}
        jenisDefault={jenisDefault}
        kategori={kategori}
        onSelesai={onTutup}
      />
    </BottomSheet>
  );
}

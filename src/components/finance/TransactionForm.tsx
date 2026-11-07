import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { hanyaDigit, formatRibuan } from '../../utils/currency';
import { dariInputDatetimeLocal, keInputDatetimeLocal } from '../../utils/date';
import { simpanTransaksi, tambahKategori } from '../../db/db';
import { buatId } from '../../utils/id';
import { useHapusTransaksi } from '../../hooks/useHapusTransaksi';
import type { JenisTransaksi, Kategori, Transaksi } from '../../types';

export function TransactionForm({
  transaksi,
  jenisDefault = 'masuk',
  kategori,
  onSelesai,
}: {
  transaksi: Transaksi | null;
  jenisDefault?: JenisTransaksi;
  kategori: Kategori[];
  onSelesai: () => void;
}) {
  const sedangEdit = transaksi !== null;
  const hapus = useHapusTransaksi();

  const [jenis, setJenis] = useState<JenisTransaksi>(transaksi?.jenis ?? jenisDefault);
  const [nominalDigit, setNominalDigit] = useState(transaksi ? String(transaksi.nominal) : '');
  const [keterangan, setKeterangan] = useState(transaksi?.keterangan ?? '');
  const [kategoriTerpilih, setKategoriTerpilih] = useState<string | undefined>(transaksi?.kategori);
  const [waktuInput, setWaktuInput] = useState(keInputDatetimeLocal(transaksi?.waktu ?? Date.now()));
  const [tambahKategoriMode, setTambahKategoriMode] = useState(false);
  const [kategoriBaru, setKategoriBaru] = useState('');

  const nominal = Number(nominalDigit);
  const bisaSimpan = nominal > 0;

  const kategoriTampil = kategori.filter((k) => k.lingkup === jenis || k.lingkup === 'umum');

  function gantiJenis(j: JenisTransaksi) {
    setJenis(j);
    if (kategoriTerpilih) {
      const valid = kategori.some(
        (k) => k.nama === kategoriTerpilih && (k.lingkup === j || k.lingkup === 'umum'),
      );
      if (!valid) setKategoriTerpilih(undefined);
    }
  }

  async function simpanKategoriBaru() {
    const nama = kategoriBaru.trim();
    if (!nama) return;
    const dibuat = await tambahKategori(nama, jenis);
    setKategoriTerpilih(dibuat.nama);
    setKategoriBaru('');
    setTambahKategoriMode(false);
  }

  async function simpan() {
    if (!bisaSimpan) return;
    const data: Transaksi = {
      id: transaksi?.id ?? buatId(),
      jenis,
      nominal,
      keterangan: keterangan.trim(),
      kategori: kategoriTerpilih,
      waktu: dariInputDatetimeLocal(waktuInput),
      dibuat: transaksi?.dibuat ?? Date.now(),
    };
    await simpanTransaksi(data);
    onSelesai();
  }

  async function hapusIni() {
    if (!transaksi) return;
    await hapus(transaksi);
    onSelesai();
  }

  const labelField = 'mb-1.5 block text-sm font-semibold text-ink-soft';
  const inputDasar =
    'w-full rounded-xl border border-line bg-card px-3 text-base text-ink placeholder:text-ink-soft/70 focus:border-brand-deep focus:outline-none';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-softer p-1">
        {(['masuk', 'keluar'] as const).map((j) => {
          const aktif = jenis === j;
          return (
            <button
              key={j}
              type="button"
              aria-pressed={aktif}
              onClick={() => gantiJenis(j)}
              className={cn(
                'min-h-[2.75rem] rounded-xl text-[15px] font-semibold transition-colors',
                aktif
                  ? j === 'masuk'
                    ? 'bg-card text-income-ink shadow-card'
                    : 'bg-card text-expense-ink shadow-card'
                  : 'text-ink-soft',
              )}
            >
              {j === 'masuk' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          );
        })}
      </div>

      <label className="block">
        <span className={labelField}>Nominal</span>
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-card px-4 focus-within:border-brand-deep">
          <span className="text-lg font-semibold text-ink-soft">Rp</span>
          <input
            inputMode="numeric"
            autoFocus={!sedangEdit}
            value={formatRibuan(nominalDigit)}
            onChange={(e) => setNominalDigit(hanyaDigit(e.target.value))}
            placeholder="0"
            aria-label="Nominal dalam rupiah"
            className="w-full bg-transparent py-3 text-2xl font-bold tabular-nums text-ink placeholder:text-ink-soft/50 focus:outline-none"
          />
        </div>
      </label>

      <label className="block">
        <span className={labelField}>Keterangan (opsional)</span>
        <input
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          placeholder={jenis === 'masuk' ? 'Pesanan 2 loyang brownies' : 'Belanja tepung & mentega'}
          className={cn(inputDasar, 'py-3')}
        />
      </label>

      <div>
        <span className={labelField}>Kategori (opsional)</span>
        <div className="flex flex-wrap gap-2">
          {kategoriTampil.map((k) => {
            const aktif = kategoriTerpilih === k.nama;
            return (
              <button
                key={k.id}
                type="button"
                aria-pressed={aktif}
                onClick={() => setKategoriTerpilih(aktif ? undefined : k.nama)}
                className={cn(
                  'min-h-[2.75rem] rounded-full px-4 text-sm font-semibold transition-colors',
                  aktif ? 'bg-brand-deep text-on-brand' : 'bg-softer text-ink',
                )}
              >
                {k.nama}
              </button>
            );
          })}
          {!tambahKategoriMode && (
            <button
              type="button"
              onClick={() => setTambahKategoriMode(true)}
              className="min-h-[2.75rem] rounded-full border border-dashed border-ink-soft/50 px-4 text-sm font-semibold text-ink-soft"
            >
              + Tambah
            </button>
          )}
        </div>
        {tambahKategoriMode && (
          <div className="mt-2 flex items-center gap-2">
            <input
              value={kategoriBaru}
              autoFocus
              onChange={(e) => setKategoriBaru(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void simpanKategoriBaru();
                }
              }}
              placeholder="Nama kategori baru"
              className={cn(inputDasar, 'py-2.5')}
            />
            <button
              type="button"
              onClick={() => void simpanKategoriBaru()}
              disabled={!kategoriBaru.trim()}
              className="min-h-[2.75rem] shrink-0 rounded-xl bg-softer px-4 text-sm font-semibold text-ink disabled:opacity-45"
            >
              Simpan
            </button>
          </div>
        )}
      </div>

      <label className="block">
        <span className={labelField}>Tanggal & jam</span>
        <input
          type="datetime-local"
          value={waktuInput}
          onChange={(e) => setWaktuInput(e.target.value)}
          className={cn(inputDasar, 'py-3')}
        />
      </label>

      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={() => void simpan()}
          disabled={!bisaSimpan}
          className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-brand-deep text-base font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-45"
        >
          {sedangEdit ? 'Simpan perubahan' : 'Catat transaksi'}
        </button>
        {sedangEdit && (
          <button
            type="button"
            onClick={() => void hapusIni()}
            className="flex min-h-[2.75rem] w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold text-expense-ink hover:bg-softer"
          >
            <Trash2 size={18} aria-hidden="true" />
            Hapus transaksi
          </button>
        )}
      </div>
    </div>
  );
}

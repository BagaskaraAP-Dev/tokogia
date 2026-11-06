import { useState } from 'react';
import { ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatRupiah } from '../../utils/currency';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useWakeLock } from '../../hooks/useWakeLock';
import type { Resep } from '../../types';

function BarisUntung({ label, nilai, tebal }: { label: string; nilai: number; tebal?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-ink-soft">{label}</span>
      <span
        className={cn(
          'tabular-nums',
          tebal ? 'font-bold' : 'font-semibold',
          tebal ? (nilai < 0 ? 'text-expense-ink' : 'text-income-ink') : 'text-ink',
        )}
      >
        {formatRupiah(nilai)}
      </span>
    </div>
  );
}

export function RecipeDetail({
  resep,
  onKembali,
  onEdit,
  onHapus,
}: {
  resep: Resep;
  onKembali: () => void;
  onEdit: () => void;
  onHapus: () => void;
}) {
  const fotoUrl = useObjectUrl(resep.foto);
  const [tercentang, setTercentang] = useState<Set<number>>(new Set());
  const [jagaLayar, setJagaLayar] = useState(true);
  useWakeLock(jagaLayar);

  const adaUntung = resep.modalBahan !== undefined && resep.hargaJual !== undefined;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <header className="grad-brand pt-safe text-white">
        <div className="mx-auto flex w-full max-w-md items-center gap-1 px-2 py-3">
          <button
            type="button"
            onClick={onKembali}
            aria-label="Kembali"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/15"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <h1 className="min-w-0 flex-1 truncate font-display text-xl font-semibold">{resep.nama}</h1>
          <button
            type="button"
            onClick={onEdit}
            aria-label="Edit resep"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/15"
          >
            <Pencil size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onHapus}
            aria-label="Hapus resep"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/15"
          >
            <Trash2 size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 space-y-6 overflow-y-auto px-4 pb-10 pt-4">
        {fotoUrl && (
          <img
            src={fotoUrl}
            alt={`Foto ${resep.nama}`}
            className="aspect-[16/10] w-full rounded-2xl object-cover"
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-softer px-3 py-1 text-sm font-semibold text-ink">
            {resep.kategori}
          </span>
          {resep.porsi && <span className="text-sm text-ink-soft">{resep.porsi}</span>}
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-card p-3 shadow-card">
          <span className="text-sm font-semibold text-ink">Jaga layar menyala saat memasak</span>
          <button
            type="button"
            role="switch"
            aria-checked={jagaLayar}
            aria-label="Jaga layar menyala"
            onClick={() => setJagaLayar((v) => !v)}
            className={cn(
              'relative h-7 w-12 shrink-0 rounded-full transition-colors',
              jagaLayar ? 'bg-brand-deep' : 'bg-ink-soft/40',
            )}
          >
            <span
              className={cn(
                'absolute top-1 h-5 w-5 rounded-full bg-white transition-all',
                jagaLayar ? 'left-6' : 'left-1',
              )}
            />
          </button>
        </div>

        {resep.bahan.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Bahan</h2>
            <ul className="rounded-2xl bg-card px-4 py-1 shadow-card">
              {resep.bahan.map((b, i) => {
                const dicentang = tercentang.has(i);
                return (
                  <li key={i} className="border-b border-line last:border-0">
                    <label className="flex items-center gap-3 py-3">
                      <input
                        type="checkbox"
                        checked={dicentang}
                        onChange={() =>
                          setTercentang((prev) => {
                            const next = new Set(prev);
                            if (next.has(i)) next.delete(i);
                            else next.add(i);
                            return next;
                          })
                        }
                        className="h-5 w-5 shrink-0 accent-brand-deep"
                      />
                      <span className={cn('flex-1 font-semibold', dicentang && 'text-ink-soft line-through')}>
                        {b.nama}
                      </span>
                      {(b.takaran || b.satuan) && (
                        <span className={cn('tabular-nums text-ink-soft', dicentang && 'line-through')}>
                          {b.takaran} {b.satuan}
                        </span>
                      )}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {resep.langkah.length > 0 && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Langkah</h2>
            <ol className="space-y-3">
              {resep.langkah.map((l, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-deep text-sm font-bold text-on-brand">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-base leading-relaxed text-ink">{l}</p>
                </li>
              ))}
            </ol>
          </section>
        )}

        {resep.catatan && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Catatan</h2>
            <p className="whitespace-pre-line rounded-2xl bg-softer p-4 text-base leading-relaxed text-ink">
              {resep.catatan}
            </p>
          </section>
        )}

        {adaUntung && (
          <section>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">Perhitungan untung</h2>
            <div className="rounded-2xl bg-card p-4 shadow-card">
              <BarisUntung label="Modal bahan" nilai={resep.modalBahan ?? 0} />
              <BarisUntung label="Harga jual" nilai={resep.hargaJual ?? 0} />
              <div className="my-1 border-t border-line" />
              <BarisUntung label="Perkiraan untung" nilai={(resep.hargaJual ?? 0) - (resep.modalBahan ?? 0)} tebal />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

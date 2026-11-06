import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { RecipeBookIllustration } from '../components/illustrations/Pastry';
import { RecipeCard } from '../components/recipes/RecipeCard';
import { RecipeForm } from '../components/recipes/RecipeForm';
import { RecipeDetail } from '../components/recipes/RecipeDetail';
import { Fab } from '../components/finance/Fab';
import { useResep } from '../hooks/useData';
import { useHapusResep } from '../hooks/useHapusResep';
import { cn } from '../utils/cn';

type Tampilan =
  | { mode: 'list' }
  | { mode: 'detail'; id: string }
  | { mode: 'baru' }
  | { mode: 'edit'; id: string };

export function ResepPage() {
  const resep = useResep();
  const hapus = useHapusResep();
  const [tampilan, setTampilan] = useState<Tampilan>({ mode: 'list' });
  const [cari, setCari] = useState('');
  const [kategori, setKategori] = useState('Semua');

  const daftarKategori = useMemo(
    () => ['Semua', ...Array.from(new Set(resep.map((r) => r.kategori)))],
    [resep],
  );

  const difilter = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return resep.filter((r) => {
      if (kategori !== 'Semua' && r.kategori !== kategori) return false;
      if (!kata) return true;
      return r.nama.toLowerCase().includes(kata);
    });
  }, [resep, cari, kategori]);

  const terpilih =
    tampilan.mode === 'detail' || tampilan.mode === 'edit'
      ? resep.find((r) => r.id === tampilan.id)
      : undefined;

  return (
    <>
      <PageHeader title="Resep" />

      <div className="mx-auto w-full max-w-md px-4 py-4">
        {resep.length === 0 ? (
          <EmptyState
            illustration={<RecipeBookIllustration className="h-full w-full" />}
            title="Buku resep masih kosong"
            hint="Ketuk tombol tambah untuk menyimpan resep pertama, lengkap dengan foto dan takaran bahan."
          />
        ) : (
          <>
            <label className="relative mb-3 block">
              <span className="sr-only">Cari resep</span>
              <Search
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft"
              />
              <input
                value={cari}
                onChange={(e) => setCari(e.target.value)}
                placeholder="Cari nama resep"
                className="min-h-[2.75rem] w-full rounded-xl border border-line bg-card pl-10 pr-3 text-base text-ink placeholder:text-ink-soft/70 focus:border-brand-deep focus:outline-none"
              />
            </label>

            {daftarKategori.length > 2 && (
              <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
                {daftarKategori.map((k) => {
                  const aktif = kategori === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      aria-pressed={aktif}
                      onClick={() => setKategori(k)}
                      className={cn(
                        'min-h-[2.5rem] shrink-0 rounded-full px-4 text-sm font-semibold transition-colors',
                        aktif ? 'bg-brand-deep text-on-brand' : 'bg-softer text-ink',
                      )}
                    >
                      {k}
                    </button>
                  );
                })}
              </div>
            )}

            {difilter.length === 0 ? (
              <EmptyState
                illustration={<RecipeBookIllustration className="h-full w-full" />}
                title="Tidak ada resep"
                hint="Coba ganti kategori atau kata pencarian."
              />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {difilter.map((r) => (
                  <RecipeCard
                    key={r.id}
                    resep={r}
                    onClick={() => setTampilan({ mode: 'detail', id: r.id })}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Fab onClick={() => setTampilan({ mode: 'baru' })} label="Tambah resep" />

      {tampilan.mode === 'detail' && terpilih && (
        <RecipeDetail
          resep={terpilih}
          onKembali={() => setTampilan({ mode: 'list' })}
          onEdit={() => setTampilan({ mode: 'edit', id: terpilih.id })}
          onHapus={() => {
            void hapus(terpilih);
            setTampilan({ mode: 'list' });
          }}
        />
      )}

      {(tampilan.mode === 'baru' || (tampilan.mode === 'edit' && terpilih)) && (
        <RecipeForm
          resep={tampilan.mode === 'edit' ? (terpilih ?? null) : null}
          onSelesai={() =>
            setTampilan(
              tampilan.mode === 'edit' && terpilih
                ? { mode: 'detail', id: terpilih.id }
                : { mode: 'list' },
            )
          }
        />
      )}
    </>
  );
}

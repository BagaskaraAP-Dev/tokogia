import { useObjectUrl } from '../../hooks/useObjectUrl';
import type { Resep } from '../../types';

export function RecipeCard({ resep, onClick }: { resep: Resep; onClick: () => void }) {
  const url = useObjectUrl(resep.foto);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-3xl bg-card text-left shadow-card"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-softer">
        {url ? (
          <img
            src={url}
            alt={`Foto ${resep.nama}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-brand/5">
            <img
              src="/logo-giaa.png"
              alt="Logo Gia's Patisserie"
              className="h-14 w-14 rounded-full object-cover opacity-60 shadow-sm ring-2 ring-white/90"
            />
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="line-clamp-2 font-display text-base font-semibold leading-snug text-ink">
          {resep.nama}
        </p>
        <p className="mt-1 text-xs text-ink-soft">{resep.kategori}</p>
      </div>
    </button>
  );
}

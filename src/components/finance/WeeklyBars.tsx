import { formatRupiah } from '../../utils/currency';
import { formatTanggalPanjang, hariSingkat } from '../../utils/date';
import type { BatangHari } from '../../utils/summary';

const TINGGI_AREA = 116;

export function WeeklyBars({ data }: { data: BatangHari[] }) {
  const maks = Math.max(1, ...data.map((d) => d.total));
  const kosong = data.every((d) => d.total === 0);

  return (
    <section className="rounded-3xl bg-card p-4 shadow-card" aria-label="Pemasukan 7 hari terakhir">
      <h3 className="mb-3 font-display text-base font-semibold text-ink">Pemasukan 7 hari</h3>

      {kosong ? (
        <p className="py-6 text-center text-sm text-ink-soft">
          Belum ada pemasukan dalam 7 hari terakhir.
        </p>
      ) : (
        <>
          <div className="flex items-end justify-between gap-2" style={{ height: TINGGI_AREA }} aria-hidden="true">
            {data.map((d) => {
              const tinggi = Math.max(4, Math.round((d.total / maks) * TINGGI_AREA));
              return (
                <div
                  key={d.mulai}
                  className="flex-1 rounded-t-lg bg-brand"
                  style={{ height: tinggi }}
                  title={formatRupiah(d.total)}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between gap-2" aria-hidden="true">
            {data.map((d) => (
              <span key={d.mulai} className="flex-1 text-center text-[11px] font-medium text-ink-soft">
                {hariSingkat(d.mulai)}
              </span>
            ))}
          </div>
        </>
      )}

      <p className="sr-only">
        {data.map((d) => `${formatTanggalPanjang(d.mulai)}: ${formatRupiah(d.total)}`).join('. ')}
      </p>
    </section>
  );
}

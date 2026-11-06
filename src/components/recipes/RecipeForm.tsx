import { useRef, useState } from 'react';
import { Camera, ChevronLeft, Plus, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatRibuan, formatRupiah, hanyaDigit } from '../../utils/currency';
import { kompresGambar } from '../../utils/image';
import { simpanResep } from '../../db/db';
import { buatId } from '../../utils/id';
import { useObjectUrl } from '../../hooks/useObjectUrl';
import { useToast } from '../ui/Toast';
import type { Bahan, Resep } from '../../types';

const SARAN_KATEGORI = ['Kue', 'Roti', 'Cookies', 'Minuman', 'Pastry'];

const labelCls = 'mb-1.5 block text-sm font-semibold text-ink-soft';
const inputCls =
  'w-full rounded-xl border border-line bg-card px-3 py-2.5 text-base text-ink placeholder:text-ink-soft/70 focus:border-brand-deep focus:outline-none';

export function RecipeForm({ resep, onSelesai }: { resep: Resep | null; onSelesai: () => void }) {
  const tampilkanToast = useToast();
  const inputFoto = useRef<HTMLInputElement>(null);
  const sedangEdit = resep !== null;

  const [nama, setNama] = useState(resep?.nama ?? '');
  const [kategori, setKategori] = useState(resep?.kategori ?? 'Kue');
  const [porsi, setPorsi] = useState(resep?.porsi ?? '');
  const [bahan, setBahan] = useState<Bahan[]>(
    resep?.bahan.length ? resep.bahan : [{ nama: '', takaran: '', satuan: '' }],
  );
  const [langkah, setLangkah] = useState<string[]>(resep?.langkah.length ? resep.langkah : ['']);
  const [catatan, setCatatan] = useState(resep?.catatan ?? '');
  const [modalDigit, setModalDigit] = useState(resep?.modalBahan ? String(resep.modalBahan) : '');
  const [hargaDigit, setHargaDigit] = useState(resep?.hargaJual ? String(resep.hargaJual) : '');
  const [foto, setFoto] = useState<Blob | undefined>(resep?.foto);
  const [memprosesFoto, setMemprosesFoto] = useState(false);
  const fotoUrl = useObjectUrl(foto);

  const daftarKategori = Array.from(new Set([...SARAN_KATEGORI, kategori]));
  const modal = Number(modalDigit) || 0;
  const harga = Number(hargaDigit) || 0;
  const untung = harga - modal;

  async function pilihFoto(file: File) {
    setMemprosesFoto(true);
    try {
      setFoto(await kompresGambar(file));
    } catch {
      tampilkanToast({ pesan: 'Foto gagal diproses. Coba foto lain.' });
    } finally {
      setMemprosesFoto(false);
    }
  }

  function ubahBahan(i: number, kunci: keyof Bahan, nilai: string) {
    setBahan((prev) => prev.map((b, j) => (j === i ? { ...b, [kunci]: nilai } : b)));
  }

  async function simpan() {
    if (!nama.trim()) return;
    const data: Resep = {
      id: resep?.id ?? buatId(),
      nama: nama.trim(),
      kategori,
      foto,
      porsi: porsi.trim() || undefined,
      bahan: bahan.filter((b) => b.nama.trim() || b.takaran.trim()),
      langkah: langkah.map((s) => s.trim()).filter(Boolean),
      catatan: catatan.trim() || undefined,
      modalBahan: modalDigit ? Number(modalDigit) : undefined,
      hargaJual: hargaDigit ? Number(hargaDigit) : undefined,
      dibuat: resep?.dibuat ?? Date.now(),
      diubah: Date.now(),
    };
    await simpanResep(data);
    onSelesai();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg">
      <header className="grad-brand pt-safe text-white">
        <div className="mx-auto flex w-full max-w-md items-center gap-2 px-2 py-3">
          <button
            type="button"
            onClick={onSelesai}
            aria-label="Kembali"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/15"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <h1 className="font-display text-xl font-semibold">{sedangEdit ? 'Edit resep' : 'Resep baru'}</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 space-y-5 overflow-y-auto px-4 py-4">
        <div>
          <input
            ref={inputFoto}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void pilihFoto(file);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => inputFoto.current?.click()}
            className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-ink-soft/40 bg-softer"
          >
            {fotoUrl ? (
              <img src={fotoUrl} alt="Pratinjau foto resep" className="h-full w-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-2 text-ink-soft">
                <Camera size={28} aria-hidden="true" />
                <span className="text-sm font-semibold">
                  {memprosesFoto ? 'Memproses foto...' : 'Ambil atau pilih foto'}
                </span>
              </span>
            )}
          </button>
          {foto && (
            <button
              type="button"
              onClick={() => setFoto(undefined)}
              className="mt-2 text-sm font-semibold text-expense-ink"
            >
              Hapus foto
            </button>
          )}
        </div>

        <label className="block">
          <span className={labelCls}>Nama resep</span>
          <input
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Brownies panggang"
            className={inputCls}
          />
        </label>

        <div>
          <span className={labelCls}>Kategori</span>
          <div className="flex flex-wrap gap-2">
            {daftarKategori.map((k) => {
              const aktif = kategori === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={aktif}
                  onClick={() => setKategori(k)}
                  className={cn(
                    'min-h-[2.5rem] rounded-full px-4 text-sm font-semibold transition-colors',
                    aktif ? 'bg-brand-deep text-on-brand' : 'bg-softer text-ink',
                  )}
                >
                  {k}
                </button>
              );
            })}
          </div>
          <input
            value={kategori}
            onChange={(e) => setKategori(e.target.value)}
            placeholder="atau ketik kategori sendiri"
            aria-label="Kategori lain"
            className={cn(inputCls, 'mt-2')}
          />
        </div>

        <label className="block">
          <span className={labelCls}>Porsi / hasil (opsional)</span>
          <input
            value={porsi}
            onChange={(e) => setPorsi(e.target.value)}
            placeholder="1 loyang 20 cm"
            className={inputCls}
          />
        </label>

        <div>
          <span className={labelCls}>Bahan</span>
          <div className="space-y-2">
            {bahan.map((b, i) => (
              <div key={i} className="rounded-xl border border-line p-2">
                <div className="flex gap-2">
                  <input
                    value={b.nama}
                    onChange={(e) => ubahBahan(i, 'nama', e.target.value)}
                    placeholder="Nama bahan"
                    aria-label={`Nama bahan ${i + 1}`}
                    className={cn(inputCls, 'flex-1')}
                  />
                  <button
                    type="button"
                    onClick={() => setBahan((prev) => prev.filter((_, j) => j !== i))}
                    aria-label={`Hapus bahan ${i + 1}`}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-soft hover:bg-softer"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2 flex gap-2">
                  <input
                    value={b.takaran}
                    onChange={(e) => ubahBahan(i, 'takaran', e.target.value)}
                    placeholder="Takaran"
                    inputMode="decimal"
                    aria-label={`Takaran bahan ${i + 1}`}
                    className={cn(inputCls, 'w-28')}
                  />
                  <input
                    value={b.satuan}
                    onChange={(e) => ubahBahan(i, 'satuan', e.target.value)}
                    placeholder="gram, butir, sdm"
                    aria-label={`Satuan bahan ${i + 1}`}
                    className={cn(inputCls, 'flex-1')}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setBahan((prev) => [...prev, { nama: '', takaran: '', satuan: '' }])}
            className="mt-2 inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-full bg-softer px-4 text-sm font-semibold text-ink"
          >
            <Plus size={16} aria-hidden="true" />
            Tambah bahan
          </button>
        </div>

        <div>
          <span className={labelCls}>Langkah</span>
          <div className="space-y-2">
            {langkah.map((l, i) => (
              <div key={i} className="flex gap-2">
                <span className="mt-2.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-softer text-xs font-bold text-brand-deep">
                  {i + 1}
                </span>
                <textarea
                  value={l}
                  onChange={(e) =>
                    setLangkah((prev) => prev.map((s, j) => (j === i ? e.target.value : s)))
                  }
                  placeholder="Tulis langkah ini"
                  aria-label={`Langkah ${i + 1}`}
                  rows={2}
                  className={cn(inputCls, 'flex-1 resize-none')}
                />
                <button
                  type="button"
                  onClick={() => setLangkah((prev) => prev.filter((_, j) => j !== i))}
                  aria-label={`Hapus langkah ${i + 1}`}
                  className="mt-1 grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-soft hover:bg-softer"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setLangkah((prev) => [...prev, ''])}
            className="mt-2 inline-flex min-h-[2.5rem] items-center gap-1.5 rounded-full bg-softer px-4 text-sm font-semibold text-ink"
          >
            <Plus size={16} aria-hidden="true" />
            Tambah langkah
          </button>
        </div>

        <label className="block">
          <span className={labelCls}>Catatan (opsional)</span>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Suhu oven 170°C, panggang 25 menit."
            rows={2}
            className={cn(inputCls, 'resize-none')}
          />
        </label>

        <div className="rounded-2xl bg-card p-4 shadow-card">
          <p className="mb-3 text-sm font-semibold text-ink-soft">Hitung untung (opsional)</p>
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="mb-1 block text-xs text-ink-soft">Modal bahan</span>
              <div className="flex items-center gap-1 rounded-xl border border-line bg-card px-2 focus-within:border-brand-deep">
                <span className="text-sm text-ink-soft">Rp</span>
                <input
                  inputMode="numeric"
                  value={formatRibuan(modalDigit)}
                  onChange={(e) => setModalDigit(hanyaDigit(e.target.value))}
                  placeholder="0"
                  className="w-full bg-transparent py-2.5 text-base tabular-nums text-ink focus:outline-none"
                />
              </div>
            </label>
            <label className="block flex-1">
              <span className="mb-1 block text-xs text-ink-soft">Harga jual</span>
              <div className="flex items-center gap-1 rounded-xl border border-line bg-card px-2 focus-within:border-brand-deep">
                <span className="text-sm text-ink-soft">Rp</span>
                <input
                  inputMode="numeric"
                  value={formatRibuan(hargaDigit)}
                  onChange={(e) => setHargaDigit(hanyaDigit(e.target.value))}
                  placeholder="0"
                  className="w-full bg-transparent py-2.5 text-base tabular-nums text-ink focus:outline-none"
                />
              </div>
            </label>
          </div>
          {(modalDigit || hargaDigit) && (
            <p className="mt-3 text-sm">
              <span className="text-ink-soft">Perkiraan untung: </span>
              <span className={cn('font-bold tabular-nums', untung < 0 ? 'text-expense-ink' : 'text-income-ink')}>
                {formatRupiah(untung)}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="border-t border-line bg-bg px-4 pb-[calc(1rem_+_env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto w-full max-w-md">
          <button
            type="button"
            onClick={() => void simpan()}
            disabled={!nama.trim()}
            className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-brand-deep text-base font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:pointer-events-none disabled:opacity-45"
          >
            {sedangEdit ? 'Simpan perubahan' : 'Simpan resep'}
          </button>
        </div>
      </div>
    </div>
  );
}

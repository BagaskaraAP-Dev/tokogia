import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Trash2 } from 'lucide-react';

const LEBAR_AKSI = 84;

/**
 * Baris yang bisa digeser ke kiri untuk memunculkan tombol hapus.
 * Ketukan biasa memanggil onBuka (edit); keyboard tetap bisa lewat tombol hapus
 * yang ikut tampil saat difokus.
 */
export function SwipeRow({
  onBuka,
  onHapus,
  labelHapus,
  children,
}: {
  onBuka: () => void;
  onHapus: () => void;
  labelHapus: string;
  children: ReactNode;
}) {
  const [geser, setGeser] = useState(0);
  const gerak = useRef({ x: 0, y: 0, awal: 0, aktif: false, arah: '' as '' | 'x' | 'y', tahanKlik: false });

  function onPointerDown(e: React.PointerEvent) {
    gerak.current = { x: e.clientX, y: e.clientY, awal: geser, aktif: true, arah: '', tahanKlik: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const g = gerak.current;
    if (!g.aktif) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (g.arah === '' && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      g.arah = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
    }
    if (g.arah === 'x') {
      g.tahanKlik = true;
      setGeser(Math.min(0, Math.max(-LEBAR_AKSI - 16, g.awal + dx)));
    }
  }

  function onPointerUp() {
    const g = gerak.current;
    if (!g.aktif) return;
    g.aktif = false;
    if (g.arah === 'x') {
      setGeser(geser <= -LEBAR_AKSI / 2 ? -LEBAR_AKSI : 0);
    }
  }

  function onClick() {
    if (gerak.current.tahanKlik) {
      gerak.current.tahanKlik = false;
      return;
    }
    if (geser !== 0) {
      setGeser(0);
      return;
    }
    onBuka();
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#C42B30]">
      <button
        type="button"
        onClick={onHapus}
        onFocus={() => setGeser(-LEBAR_AKSI)}
        onBlur={() => setGeser(0)}
        aria-label={labelHapus}
        className="absolute inset-y-0 right-0 flex flex-col items-center justify-center gap-0.5 text-white"
        style={{ width: LEBAR_AKSI }}
      >
        <Trash2 size={18} aria-hidden="true" />
        <span className="text-xs font-semibold">Hapus</span>
      </button>
      <button
        type="button"
        onClick={onClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ transform: `translateX(${geser}px)`, touchAction: 'pan-y' }}
        className="relative block w-full rounded-2xl text-left transition-transform"
      >
        {children}
      </button>
    </div>
  );
}

import { Check, Share, SquarePlus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { BottomSheet } from './ui/BottomSheet';

const langkah: { icon: LucideIcon; teks: string }[] = [
  { icon: Share, teks: 'Ketuk tombol Bagikan (kotak dengan panah ke atas) di bar Safari.' },
  { icon: SquarePlus, teks: 'Gulir dan pilih "Tambahkan ke Layar Utama".' },
  { icon: Check, teks: 'Ketuk "Tambah". Ikon Gia\'s Patisserie muncul di Home Screen.' },
];

export function OnboardingTip({ open, onTutup }: { open: boolean; onTutup: () => void }) {
  return (
    <BottomSheet open={open} onClose={onTutup} title="Pasang ke Home Screen">
      <div className="space-y-5">
        <p className="text-sm leading-relaxed text-ink-soft">
          Tambahkan ke Layar Utama supaya cepat dibuka seperti aplikasi dan datanya lebih aman.
          Safari bisa menghapus data situs yang lama tidak dibuka, aplikasi terpasang lebih aman.
        </p>
        <ol className="space-y-3">
          {langkah.map(({ icon: Icon, teks }, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-softer text-brand-deep">
                <Icon size={20} aria-hidden="true" />
              </span>
              <span className="text-[15px] text-ink">{teks}</span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={onTutup}
          className="flex min-h-[3rem] w-full items-center justify-center rounded-2xl bg-brand-deep text-base font-semibold text-on-brand hover:bg-brand-hover"
        >
          Mengerti
        </button>
      </div>
    </BottomSheet>
  );
}

import { BookHeart, Home, Receipt, Settings, type LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

export type TabId = 'beranda' | 'riwayat' | 'resep' | 'pengaturan';

const tabs: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'beranda', label: 'Beranda', icon: Home },
  { id: 'riwayat', label: 'Riwayat', icon: Receipt },
  { id: 'resep', label: 'Resep', icon: BookHeart },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
];

export function TabBar({ active, onChange }: { active: TabId; onChange: (id: TabId) => void }) {
  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#2a0e20] bg-[#120610]/95 pb-safe backdrop-blur-md"
    >
      <ul className="mx-auto flex w-full max-w-md px-3 py-1.5">
        {tabs.map(({ id, label, icon: Icon }) => {
          const selected = id === active;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={selected ? 'page' : undefined}
                className={cn(
                  'flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-1 rounded-2xl py-1 transition-all',
                  selected
                    ? 'bg-[#331224] text-[#f472b6] font-bold shadow-sm'
                    : 'text-[#8e687c] hover:text-[#d4a5b8]',
                )}
              >
                <Icon size={20} strokeWidth={selected ? 2.2 : 1.8} aria-hidden="true" />
                <span className="text-[11px] font-semibold tracking-tight">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

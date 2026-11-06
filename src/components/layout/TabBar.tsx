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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-safe backdrop-blur-md"
    >
      <ul className="mx-auto flex w-full max-w-md">
        {tabs.map(({ id, label, icon: Icon }) => {
          const selected = id === active;
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={selected ? 'page' : undefined}
                className={cn(
                  'flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-1 py-2 transition-colors',
                  selected ? 'text-brand-deep' : 'text-ink-soft',
                )}
              >
                <Icon size={22} strokeWidth={selected ? 2.4 : 1.8} aria-hidden="true" />
                <span className="text-[11px] font-semibold tracking-tight">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

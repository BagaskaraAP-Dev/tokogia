import { useEffect, useState } from 'react';
import { TabBar, type TabId } from './components/layout/TabBar';
import { ToastProvider } from './components/ui/Toast';
import { OnboardingTip } from './components/OnboardingTip';
import { pastikanSeed } from './db/db';
import { BerandaPage } from './pages/BerandaPage';
import { RiwayatPage } from './pages/RiwayatPage';
import { ResepPage } from './pages/ResepPage';
import { PengaturanPage } from './pages/PengaturanPage';

const KUNCI_ONBOARDING = 'giaa-onboarding-dilihat';

function sudahStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function App() {
  const [tab, setTab] = useState<TabId>('beranda');
  const [tipTerbuka, setTipTerbuka] = useState(false);

  useEffect(() => {
    void pastikanSeed();
  }, []);

  useEffect(() => {
    try {
      const sudahDilihat = localStorage.getItem(KUNCI_ONBOARDING) === '1';
      if (!sudahDilihat && !sudahStandalone()) setTipTerbuka(true);
    } catch {
      // localStorage bisa diblokir; lewati tip saja.
    }
  }, []);

  function tutupTip() {
    setTipTerbuka(false);
    try {
      localStorage.setItem(KUNCI_ONBOARDING, '1');
    } catch {
      // Abaikan: tip cuma akan muncul lagi lain kali.
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bg text-ink">
        <main className="mx-auto w-full max-w-md pb-[calc(4.25rem_+_env(safe-area-inset-bottom))]">
          {tab === 'beranda' && <BerandaPage />}
          {tab === 'riwayat' && <RiwayatPage />}
          {tab === 'resep' && <ResepPage />}
          {tab === 'pengaturan' && <PengaturanPage />}
        </main>
        <TabBar active={tab} onChange={setTab} />
      </div>
      <OnboardingTip open={tipTerbuka} onTutup={tutupTip} />
    </ToastProvider>
  );
}

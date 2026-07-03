import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';
import PageTransition from './PageTransition';
import AchievementToast from '../shared/AchievementToast';
import InstallBanner from '../shared/InstallBanner';
import { useSettings } from '../../hooks/useSettings';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function AppLayout() {
  const settings = useSettings();
  const [collapsed, setCollapsed] = useState(settings.sidebarCollapsed ?? false);
  const isMobile = useIsMobile();
  const location = useLocation();

  return (
    <div className="flex min-h-dvh w-full bg-background">
      {!isMobile && (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      )}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Header />

        <main
          className={cn(
            'flex-1 overflow-x-hidden overflow-y-auto',
            isMobile
              ? 'px-4 pt-4 pb-[calc(4rem+var(--safe-bottom)+1rem)]'
              : 'px-6 py-6 md:px-7 md:pb-8',
          )}
        >
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {isMobile && <BottomNav />}

      <AchievementToast />
      <InstallBanner />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';
import PageTransition from './PageTransition';
import AchievementToast from '../shared/AchievementToast';
import Toast from '../shared/Toast';
import InstallBanner from '../shared/InstallBanner';
import { useSettings } from '../../hooks/useSettings';

const MOBILE_BP = 768;

export default function AppLayout() {
  const settings = useSettings();
  const [collapsed, setCollapsed] = useState(settings.sidebarCollapsed ?? false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < MOBILE_BP);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < MOBILE_BP);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div style={{
      display: 'flex',
      minHeight: '100dvh',
      width: '100%',
      background: 'var(--color-bg)',
    }}>
      {/* Desktop sidebar */}
      {!isMobile && (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      )}

      {/* Main column */}
      <div style={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
      }}>
        <Header />

        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: isMobile ? '16px' : '24px 28px',
          paddingBottom: isMobile
            ? `calc(64px + var(--safe-bottom) + 16px)`
            : '32px',
        }}>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && <BottomNav />}

      {/* Global toasts */}
      <AchievementToast />
      <Toast />
      <InstallBanner />
    </div>
  );
}

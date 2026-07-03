import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { authApi } from './api/auth';
import { useTheme } from './hooks/useTheme';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Focus from './pages/Focus';
import Tasks    from './pages/Tasks';
import Calendar      from './pages/Calendar';
import Achievements  from './pages/Achievements';
import Analytics     from './pages/Analytics';
import Goals         from './pages/Goals';
import Projects      from './pages/Projects';
import Journal       from './pages/Journal';
import Settings      from './pages/Settings';
import Upgrade       from './pages/Upgrade';
import Landing from './pages/Landing';
import Pricing from './pages/Pricing';

import LoadingSpinner from '@/components/shared/LoadingSpinner';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner />;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

// "/" shows landing for guests, redirects to dashboard for logged-in users
function HomeRoute() {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <LoadingSpinner />;
  return user ? <Navigate to="/dashboard" replace /> : <Landing />;
}

export default function App() {
  useEffect(() => {
    let cancelled = false;

    authApi.refresh()
      .then((res) => {
        if (cancelled) return null;
        useAuthStore.getState().setAccessToken(res.data.data.accessToken);
        return authApi.me();
      })
      .then((res) => {
        if (cancelled || !res) return;
        const store = useAuthStore.getState();
        store.setAuth(res.data.data.user, store.accessToken ?? '');
      })
      .catch(() => {
        if (cancelled) return;
        useAuthStore.getState().logout();
      });

    return () => { cancelled = true; };
  }, []); // empty — reads store via getState() to avoid closure/subscription issues

  return (
    <ThemeProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<HomeRoute />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
            <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />

            {/* Protected app pages */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/focus"  element={<Focus />} />
              <Route path="/tasks"    element={<Tasks />} />
              <Route path="/calendar"      element={<Calendar />} />
              <Route path="/achievements"  element={<Achievements />} />
              <Route path="/analytics"     element={<Analytics />} />
              <Route path="/goals"         element={<Goals />} />
              <Route path="/projects"      element={<Projects />} />
              <Route path="/journal"       element={<Journal />} />
              <Route path="/settings"      element={<Settings />} />
              <Route path="/upgrade"       element={<Upgrade />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors closeButton position="top-right" />
      </TooltipProvider>
    </ThemeProvider>
  );
}

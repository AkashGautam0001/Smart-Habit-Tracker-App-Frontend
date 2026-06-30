import { Link, useLocation } from 'react-router-dom';
import * as Icons from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { NAV_ITEMS } from '../../config/nav.config';
import { getLevelProgress } from '../../config/xp.config';

function NavIcon({ name, ...props }: { name: string; [k: string]: unknown }) {
  const Icon = (Icons as unknown as Record<string, React.ElementType>)[name];
  return Icon ? <Icon {...props} /> : null;
}

export default function Header() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const currentNavItem = NAV_ITEMS.find(
    (item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/'),
  );

  const xpProgress = user ? getLevelProgress(user.xp, user.level) : 0;

  return (
    <header style={{
      alignItems: 'center',
      background: 'color-mix(in srgb, var(--color-bg) 95%, transparent)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      flexShrink: 0,
      gap: 12,
      height: 56,
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
    }}>
      {/* Page title */}
      <h1 style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em', margin: 0 }}>
        {currentNavItem?.label ?? 'HabitFlow'}
      </h1>

      {/* Right side */}
      <div style={{ alignItems: 'center', display: 'flex', gap: 6 }}>
        {/* Mobile XP pill (sidebar hidden on mobile) */}
        {user && (
          <div className="show-mobile" style={{
            alignItems: 'center',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 99,
            display: 'flex',
            gap: 6,
            padding: '4px 10px',
          }}>
            <div style={{ background: 'var(--color-border)', borderRadius: 99, height: 4, overflow: 'hidden', width: 44 }}>
              <div style={{
                background: 'linear-gradient(90deg, var(--color-accent), #8b5cf6)',
                borderRadius: 99,
                height: '100%',
                transition: 'width 0.8s ease',
                width: `${xpProgress}%`,
              }} />
            </div>
            <span style={{ color: 'var(--color-warning)', fontSize: '0.7rem', fontWeight: 700 }}>
              Lv{user.level}
            </span>
          </div>
        )}

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          style={{
            alignItems: 'center',
            background: 'none',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            padding: 8,
          }}
        >
          <NavIcon name="Bell" size={18} weight="duotone" color="var(--color-text-muted)" />
        </button>

        {/* Pro badge */}
        {user?.plan === 'pro' && (
          <span style={{
            background: 'color-mix(in srgb, var(--color-accent) 15%, transparent)',
            border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)',
            borderRadius: 99,
            color: 'var(--color-accent)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.05em',
            padding: '2px 8px',
            textTransform: 'uppercase',
          }}>
            Pro
          </span>
        )}

        {/* Avatar → links to settings */}
        <Link
          to="/settings"
          style={{
            alignItems: 'center',
            background: 'var(--color-accent)',
            borderRadius: '50%',
            color: '#fff',
            display: 'flex',
            flexShrink: 0,
            fontSize: '0.78rem',
            fontWeight: 700,
            height: 32,
            justifyContent: 'center',
            textDecoration: 'none',
            width: 32,
          }}
        >
          {user?.name?.charAt(0).toUpperCase() ?? 'U'}
        </Link>
      </div>
    </header>
  );
}

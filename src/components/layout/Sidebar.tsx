import { NavLink, useNavigate } from 'react-router-dom';
import * as Icons from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useSettings } from '../../hooks/useSettings';
import { NAV_ITEMS } from '../../config/nav.config';
import { getLevelProgress } from '../../config/xp.config';
import { authApi } from '../../api/auth';
import { APP_CONFIG } from '../../config/app.config';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function NavIcon({ name, ...props }: { name: string; [k: string]: unknown }) {
  const Icon = (Icons as unknown as Record<string, React.ElementType>)[name];
  return Icon ? <Icon {...props} /> : null;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  useSettings();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    navigate('/login');
  };

  const xpProgress = user ? getLevelProgress(user.xp, user.level) : 0;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        zIndex: 20,
      }}
    >
      {/* Logo + collapse toggle */}
      <div style={{
        alignItems: 'center', display: 'flex', gap: 12,
        justifyContent: collapsed ? 'center' : 'space-between',
        padding: '20px 16px 16px',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              key="logo"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ color: 'var(--color-accent)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}
            >
              {APP_CONFIG.name}
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={onToggle}
          className="btn-ghost"
          style={{ padding: 8, borderRadius: 8, minWidth: 'auto', minHeight: 'auto' }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <NavIcon name={collapsed ? 'SidebarSimple' : 'SidebarSimple'} size={18} weight="bold" color="var(--color-text-muted)" />
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            title={collapsed ? item.label : undefined}
            style={({ isActive }) => ({
              alignItems: 'center',
              borderRadius: 10,
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
              display: 'flex',
              fontWeight: isActive ? 600 : 400,
              gap: 12,
              justifyContent: collapsed ? 'center' : 'flex-start',
              marginBottom: 2,
              minHeight: 44,
              padding: collapsed ? '10px' : '10px 12px',
              textDecoration: 'none',
              transition: 'all 150ms ease',
              background: isActive ? 'color-mix(in srgb, var(--color-accent) 12%, transparent)' : 'transparent',
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            })}
          >
            {({ isActive }) => (
              <>
                <NavIcon
                  name={item.icon}
                  size={20}
                  weight={isActive ? 'fill' : 'duotone'}
                  color={isActive ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* XP bar + user */}
      <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 8px' }}>
        {/* XP bar */}
        {!collapsed && user && (
          <div style={{ marginBottom: 12, padding: '0 4px' }}>
            <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>Level {user.level}</span>
              <span style={{ color: 'var(--color-warning)', fontSize: '0.75rem', fontWeight: 600 }}>{user.xp} XP</span>
            </div>
            <div style={{ background: 'var(--color-border)', borderRadius: 99, height: 4, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ background: 'var(--color-warning)', borderRadius: 99, height: '100%' }}
              />
            </div>
          </div>
        )}

        {/* User info */}
        <div style={{
          alignItems: 'center', borderRadius: 10, display: 'flex',
          gap: 10, justifyContent: collapsed ? 'center' : 'space-between',
          padding: '8px 4px',
        }}>
          {/* Avatar */}
          <div style={{
            alignItems: 'center', background: 'var(--color-accent)', borderRadius: '50%',
            color: '#fff', display: 'flex', flexShrink: 0,
            fontSize: '0.8rem', fontWeight: 700,
            height: 32, justifyContent: 'center', width: 32,
          }}>
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </div>

          {!collapsed && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'var(--color-text)', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.plan === 'pro' ? '✨ Pro' : 'Free'}
              </div>
            </div>
          )}

          {!collapsed && (
            <button
              onClick={handleLogout}
              className="btn-ghost"
              style={{ padding: 6, borderRadius: 8, minWidth: 'auto', minHeight: 'auto' }}
              title="Sign out"
            >
              <NavIcon name="SignOut" size={16} weight="bold" color="var(--color-text-muted)" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

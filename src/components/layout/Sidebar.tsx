import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretDoubleLeftIcon, CaretRightIcon, LightningIcon } from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { useSettings } from '../../hooks/useSettings';
import { NAV_ITEMS, NAV_GROUPS } from '../../config/nav.config';
import { APP_CONFIG } from '../../config/app.config';
import NavIcon from './NavIcon';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'mb-0.5 flex min-h-[2.2rem] items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150',
    isActive
      ? 'bg-linear-to-r from-primary to-[#8b5cf6] font-medium text-primary-foreground shadow-md shadow-primary/25'
      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
  );

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuthStore();
  useSettings();

  const isPro = user?.plan === 'pro';
  const dashboardItem = NAV_ITEMS.find((i) => i.id === 'dashboard') ?? NAV_ITEMS[0];

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="sticky top-0 z-20 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-border bg-card"
    >
      {/* Brand header */}
      <div
        className={cn(
          'flex h-14 shrink-0 items-center border-b border-border',
          collapsed ? 'justify-center px-0' : 'gap-2.5 px-4',
        )}
      >
        <button
          onClick={collapsed ? onToggle : undefined}
          aria-label={collapsed ? 'Expand sidebar' : undefined}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-[#8b5cf6] text-sm font-bold text-primary-foreground"
        >
          {APP_CONFIG.name.charAt(0)}
        </button>

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="brand"
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.15 }}
              className="flex min-w-0 flex-1 items-center justify-between gap-1"
            >
              <div className="min-w-0">
                <div className="truncate text-[0.95rem] font-bold tracking-tight text-foreground">
                  {APP_CONFIG.name}
                </div>
                <div className="truncate text-[0.62rem] text-muted-foreground">
                  {APP_CONFIG.tagline}
                </div>
              </div>
              <button
                onClick={onToggle}
                aria-label="Collapse sidebar"
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <CaretDoubleLeftIcon size={13} weight="bold" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {/* Dashboard — standalone, no group label */}
        <NavLink
          to={dashboardItem.path}
          title={collapsed ? dashboardItem.label : undefined}
          className={(state) => cn(navLinkClass(state), collapsed ? 'justify-center' : '', 'mb-4')}
        >
          {({ isActive }) => (
            <>
              <NavIcon
                name={dashboardItem.icon}
                size={18}
                weight={isActive ? 'fill' : 'duotone'}
                className={isActive ? 'shrink-0 text-primary-foreground' : 'shrink-0'}
              />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="truncate whitespace-nowrap"
                  >
                    {dashboardItem.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </>
          )}
        </NavLink>

        {NAV_GROUPS.filter((g) => g.id !== 'main').map((group) => {
          const items = NAV_ITEMS.filter((i) => i.group === group.id);
          if (items.length === 0) return null;

          return (
            <div key={group.id} className="mb-5 last:mb-0">
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.p
                    key={`label-${group.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="mb-1.5 px-3 text-[0.62rem] font-semibold uppercase tracking-widest text-muted-foreground/50"
                  >
                    {group.label}
                  </motion.p>
                )}
              </AnimatePresence>

              {items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={(state) => cn(navLinkClass(state), collapsed ? 'justify-center' : '')}
                >
                  {({ isActive }) => (
                    <>
                      <NavIcon
                        name={item.icon}
                        size={18}
                        weight={isActive ? 'fill' : 'duotone'}
                        className={isActive ? 'shrink-0 text-primary-foreground' : 'shrink-0'}
                      />
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span
                            key="label"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            className="truncate whitespace-nowrap"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Profile + Pro card */}
      <AnimatePresence>
        {!collapsed && user && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mx-3 mb-3 rounded-xl border border-border bg-secondary/40 p-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-[#8b5cf6] text-[0.8rem] font-bold text-primary-foreground">
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-[0.82rem] font-medium text-foreground">{user.name}</span>
                  {isPro && (
                    <Badge className="h-4.5 shrink-0 bg-linear-to-r from-primary to-[#8b5cf6] px-1.5 text-[0.6rem]">
                      Pro
                    </Badge>
                  )}
                </div>
                <div className="truncate text-[0.68rem] text-muted-foreground">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </div>
              </div>
            </div>

            {!isPro && (
              <>
                <div className="my-2.5 border-t border-border" />
                <Link
                  to="/upgrade"
                  className="group flex items-center justify-between gap-2 no-underline"
                >
                  <div className="min-w-0">
                    <div className="text-[0.75rem] font-medium text-foreground">Unlock more with Pro</div>
                    <div className="truncate text-[0.65rem] text-muted-foreground">
                      Advanced stats, reminders,
                    </div>
                  </div>
                  <CaretRightIcon
                    size={13}
                    className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
                <Button size="sm" className="mt-2 w-full gap-1.5 bg-linear-to-r from-primary to-[#8b5cf6] text-xs hover:opacity-90" asChild>
                  <Link to="/upgrade">
                    <LightningIcon size={13} weight="fill" />
                    Upgrade to Pro
                  </Link>
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}

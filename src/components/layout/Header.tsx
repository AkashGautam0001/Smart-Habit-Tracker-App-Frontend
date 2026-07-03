import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BellIcon, MagnifyingGlassIcon, XIcon, GearIcon, SignOutIcon,
  SparkleIcon, CaretDownIcon, RobotIcon,
} from '@phosphor-icons/react';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { NAV_ITEMS } from '../../config/nav.config';
import { getLevelProgress } from '../../config/xp.config';
import { usePlan } from '../../hooks/usePlan';
import DailyReviewCard from '../ai/DailyReviewCard';
import UpgradePrompt from '../shared/UpgradePrompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isPro } = usePlan();
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [query, setQuery] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    navigate('/login');
  };

  const currentNavItem = NAV_ITEMS.find(
    (item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/'),
  );

  const searchableRoutes = NAV_ITEMS.map((i) => ({ label: i.label, path: i.path }));
  const filtered = query.trim()
    ? searchableRoutes.filter((r) => r.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setQuery('');
  };

  const xpProgress = user ? getLevelProgress(user.xp, user.level) : 0;

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-sm md:px-5">
      {/* Page title */}
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <h1 className="shrink-0 truncate text-[0.95rem] font-semibold text-foreground">
          {currentNavItem?.label ?? (location.pathname.startsWith('/settings') ? 'Settings' : 'HabitFlow')}
        </h1>

        {user && (
          <div className="hidden min-w-0 items-center gap-2.5 border-l border-border pl-4 sm:flex">
            <span className="shrink-0 text-[0.72rem] font-medium text-muted-foreground">
              Level {user.level}
            </span>
            <Progress value={xpProgress} className="h-1 w-28 **:data-[slot=progress-indicator]:bg-linear-to-r **:data-[slot=progress-indicator]:from-amber-400 **:data-[slot=progress-indicator]:to-orange-500" />
            <span className="shrink-0 text-[0.72rem] text-muted-foreground">
              {user.xp.toLocaleString()} XP
            </span>
            <button
              type="button"
              onClick={() => setAiOpen(true)}
              aria-label="AI Coach"
              title="AI Coach"
              className="flex size-5 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-amber-400 to-orange-500 text-white transition-transform hover:scale-110"
            >
              <SparkleIcon size={11} weight="fill" />
            </button>
          </div>
        )}
      </div>

      {/* Search (desktop) */}
      <div className="hidden md:block">
        {searchOpen ? (
          <div className="relative w-72">
            <MagnifyingGlassIcon
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') { setSearchOpen(false); setQuery(''); }
                if (e.key === 'Enter' && filtered[0]) handleSearchSelect(filtered[0].path);
              }}
              onBlur={() => { if (!query) setSearchOpen(false); }}
              placeholder="Search habits, tasks…"
              className="h-9 pl-7 pr-7 text-sm"
            />
            <button
              onClick={() => { setSearchOpen(false); setQuery(''); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <XIcon size={12} />
            </button>
            {filtered.length > 0 && (
              <div className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-lg">
                {filtered.map((r) => (
                  <button
                    key={r.path}
                    onClick={() => handleSearchSelect(r.path)}
                    className="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              'flex h-9 w-72 items-center gap-2 rounded-md border border-border bg-muted/50 px-2.5 text-sm text-muted-foreground',
              'hover:border-border/80 hover:bg-muted transition-colors',
            )}
          >
            <MagnifyingGlassIcon size={13} />
            <span className="flex-1 text-left text-[0.8rem]">Search habits, tasks…</span>
            <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[0.62rem] text-muted-foreground lg:inline">
              ⌘K
            </kbd>
          </button>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5">
        {/* Mobile search */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden text-muted-foreground"
          aria-label="Search"
          onClick={() => setSearchOpen((v) => !v)}
        >
          <MagnifyingGlassIcon size={17} weight="bold" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          className="relative text-muted-foreground"
        >
          <BellIcon size={17} weight="duotone" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-destructive" />
        </Button>

        {user?.plan === 'pro' && (
          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-[0.68rem]">
            Pro
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex shrink-0 items-center gap-1 rounded-full py-0.5 pl-0.5 pr-1.5 hover:bg-muted transition-colors"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-[#8b5cf6] text-[0.7rem] font-bold text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() ?? 'U'}
              </span>
              <CaretDownIcon size={11} weight="bold" className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-44">
            <DropdownMenuLabel className="truncate">{user?.name ?? 'Account'}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/settings">
                <GearIcon size={15} />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <SignOutIcon size={15} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* AI Coach dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-amber-400 to-orange-500 text-white">
              <RobotIcon size={19} weight="duotone" />
            </div>
            <DialogTitle>AI Coach</DialogTitle>
            <DialogDescription>Personalized insights based on your activity.</DialogDescription>
          </DialogHeader>
          {isPro ? (
            <DailyReviewCard date={today} />
          ) : (
            <UpgradePrompt feature="aiCoach" />
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
}

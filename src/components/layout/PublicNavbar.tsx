import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ListIcon, XIcon } from '@phosphor-icons/react';
import { APP_CONFIG } from '../../config/app.config';
import { useAuthStore } from '../../store/authStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it Works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
] as const;

export default function PublicNavbar() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const navLinkClass =
    'rounded-lg px-3.5 py-2 text-sm font-medium text-muted-foreground no-underline transition-colors hover:text-foreground';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-[100] transition-all duration-200',
        scrolled
          ? 'border-b border-border bg-background/90 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link
          to="/"
          className="text-xl font-bold tracking-tight text-primary no-underline"
        >
          {APP_CONFIG.name}
        </Link>

        <div className="hide-mobile flex items-center gap-1">
          {LINKS.map((link) =>
            link.href.startsWith('#') ? (
              <a key={link.href} href={link.href} className={navLinkClass}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} to={link.href} className={navLinkClass}>
                {link.label}
              </Link>
            ),
          )}
        </div>

        <div className="hide-mobile flex items-center gap-2">
          {user ? (
            <Button asChild size="sm">
              <Link to="/dashboard">Open App</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Get Started Free</Link>
              </Button>
            </>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="show-mobile"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <ListIcon size={22} />
        </Button>
      </nav>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-full max-w-sm">
          <SheetHeader>
            <SheetTitle className="text-left text-primary">{APP_CONFIG.name}</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-1 px-1 pt-4">
            {LINKS.map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-base text-muted-foreground no-underline"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block py-3 text-base text-muted-foreground no-underline"
                >
                  {link.label}
                </Link>
              ),
            )}

            <Separator className="my-3" />

            <div className="flex flex-col gap-2">
              {user ? (
                <Button asChild className="w-full">
                  <Link to="/dashboard">Open App</Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link to="/register">Get Started Free</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

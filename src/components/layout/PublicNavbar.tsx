import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ListIcon, XIcon } from '@phosphor-icons/react';
import { APP_CONFIG } from '../../config/app.config';
import { useAuthStore } from '../../store/authStore';

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

  // close mobile menu on nav
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const links = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '/pricing' },
  ];

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent',
      background: scrolled ? 'color-mix(in srgb, var(--color-bg) 90%, transparent)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      transition: 'all 0.2s ease',
    }}>
      <nav style={{
        maxWidth: 1120, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        {/* Logo */}
        <Link to="/" style={{ color: 'var(--color-accent)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.03em', textDecoration: 'none' }}>
          {APP_CONFIG.name}
        </Link>

        {/* Desktop links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="hide-mobile">
          {links.map((link) => (
            link.href.startsWith('#') ? (
              <a key={link.href} href={link.href} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500, padding: '8px 14px', textDecoration: 'none', borderRadius: 8, transition: 'color 0.15s' }}>
                {link.label}
              </a>
            ) : (
              <Link key={link.href} to={link.href} style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', fontWeight: 500, padding: '8px 14px', textDecoration: 'none', borderRadius: 8 }}>
                {link.label}
              </Link>
            )
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hide-mobile">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '8px 18px' }}>
              Open App
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ fontSize: '0.875rem', padding: '8px 18px' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '8px 18px' }}>
                Get Started Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="show-mobile"
          onClick={() => setMenuOpen((o) => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', padding: 8 }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <XIcon size={22} /> : <ListIcon size={22} />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              borderTop: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              padding: '12px 24px 20px',
              display: 'flex', flexDirection: 'column', gap: 4,
            }}
          >
            {links.map((link) => (
              link.href.startsWith('#') ? (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', padding: '12px 0', textDecoration: 'none', display: 'block' }}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} to={link.href}
                  style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', padding: '12px 0', textDecoration: 'none', display: 'block' }}>
                  {link.label}
                </Link>
              )
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {user ? (
                <Link to="/dashboard" className="btn btn-primary" style={{ textAlign: 'center' }}>Open App</Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost" style={{ textAlign: 'center' }}>Sign In</Link>
                  <Link to="/register" className="btn btn-primary" style={{ textAlign: 'center' }}>Get Started Free</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

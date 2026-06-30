import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceMobileIcon, XIcon } from '@phosphor-icons/react';

const DISMISSED_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [prompt,   setPrompt]   = useState<BeforeInstallPromptEvent | null>(null);
  const [visible,  setVisible]  = useState(false);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setAccepted(true);
    dismiss();
  };

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  if (accepted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -32 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -32 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          style={{
            alignItems: 'center',
            background: 'color-mix(in srgb, var(--color-accent) 10%, var(--color-surface))',
            border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            gap: 12,
            left: '50%',
            maxWidth: 420,
            padding: '10px 14px',
            position: 'fixed',
            top: 16,
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            zIndex: 500,
          }}
        >
          <div style={{
            alignItems: 'center',
            background: 'color-mix(in srgb, var(--color-accent) 18%, transparent)',
            borderRadius: 8, color: 'var(--color-accent)',
            display: 'flex', flexShrink: 0,
            height: 34, justifyContent: 'center', width: 34,
          }}>
            <DeviceMobileIcon size={18} weight="duotone" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'var(--color-text)', fontSize: '0.82rem', fontWeight: 600 }}>
              Install HabitFlow
            </p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.73rem' }}>
              Add to home screen for the best experience
            </p>
          </div>

          <button
            onClick={handleInstall}
            style={{
              background: 'var(--color-accent)', border: 'none',
              borderRadius: 'var(--radius-md)', color: '#fff',
              cursor: 'pointer', flexShrink: 0,
              fontSize: '0.78rem', fontWeight: 600,
              minHeight: 'auto', minWidth: 'auto', padding: '6px 12px',
            }}
          >
            Install
          </button>

          <button
            onClick={dismiss}
            style={{
              background: 'none', border: 'none',
              color: 'var(--color-text-muted)', cursor: 'pointer',
              display: 'flex', flexShrink: 0,
              minHeight: 'auto', minWidth: 'auto', padding: 4,
            }}
          >
            <XIcon size={14} weight="bold" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

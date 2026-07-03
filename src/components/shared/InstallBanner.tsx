import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DeviceMobileIcon, XIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DISMISSED_KEY = 'pwa-install-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
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
          className={cn(
            'fixed top-4 left-1/2 z-[500] flex w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2',
            'items-center gap-3 rounded-lg border border-primary/30 bg-card p-3 shadow-lg',
          )}
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <DeviceMobileIcon size={18} weight="duotone" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Install HabitFlow</p>
            <p className="text-xs text-muted-foreground">
              Add to home screen for the best experience
            </p>
          </div>

          <Button size="sm" onClick={handleInstall} className="shrink-0">
            Install
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={dismiss}
            className="shrink-0"
            aria-label="Dismiss install banner"
          >
            <XIcon size={14} weight="bold" className="text-muted-foreground" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

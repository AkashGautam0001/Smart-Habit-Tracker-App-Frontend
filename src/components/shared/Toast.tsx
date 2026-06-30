import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XCircleIcon, InfoIcon, XIcon } from '@phosphor-icons/react';
import { useToastStore } from '../../store/toastStore';

const ICONS = {
  success: <CheckCircleIcon size={16} weight="fill" color="#22c55e" />,
  error:   <XCircleIcon   size={16} weight="fill" color="#ef4444" />,
  info:    <InfoIcon      size={16} weight="fill" color="var(--color-accent)" />,
};

const BORDER = {
  success: 'rgba(34,197,94,0.35)',
  error:   'rgba(239,68,68,0.35)',
  info:    'rgba(99,102,241,0.35)',
};

export default function Toast() {
  const { toasts, dismiss } = useToastStore();

  return (
    <div style={{
      bottom: 80, display: 'flex', flexDirection: 'column',
      gap: 8, pointerEvents: 'none',
      position: 'fixed', right: 20, zIndex: 1000,
    }}>
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.92 }}
            animate={{ opacity: 1, x: 0,  scale: 1     }}
            exit={{    opacity: 0, x: 60, scale: 0.92  }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            style={{
              alignItems: 'center',
              background: 'var(--color-surface)',
              border: `1px solid ${BORDER[t.type]}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex', gap: 10,
              maxWidth: 300, minWidth: 200,
              padding: '11px 14px',
              pointerEvents: 'auto',
            }}
          >
            <span style={{ flexShrink: 0 }}>{ICONS[t.type]}</span>
            <span style={{ color: 'var(--color-text)', flex: 1, fontSize: '0.83rem', lineHeight: 1.35 }}>
              {t.message}
            </span>
            <button
              onClick={() => dismiss(t.id)}
              style={{
                background: 'none', border: 'none',
                color: 'var(--color-text-muted)', cursor: 'pointer',
                display: 'flex', flexShrink: 0,
                minHeight: 'auto', minWidth: 'auto', padding: 2,
              }}
            >
              <XIcon size={13} weight="bold" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

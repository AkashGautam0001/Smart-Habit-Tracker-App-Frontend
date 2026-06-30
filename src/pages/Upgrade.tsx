import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon, CrownIcon, LightningIcon, StarIcon, ShieldCheck,
  ChartBarIcon, RobotIcon, Export, PaletteIcon, TargetIcon,
} from '@phosphor-icons/react';
import { useCreateOrder, useVerifyPayment, useSubscriptionStatus } from '../hooks/useSubscription';
import { useAuthStore } from '../store/authStore';
import { APP_CONFIG } from '../config/app.config';
import { PLANS } from '../config/plans.config';

const PRO_FEATURES = [
  { icon: CheckCircleIcon,  text: 'Unlimited habits (Free is limited to 10)' },
  { icon: ChartBarIcon,     text: 'Full analytics — monthly, yearly, 365-day heatmap' },
  { icon: TargetIcon,       text: 'Goals & Projects to organise your work' },
  { icon: RobotIcon,        text: 'AI Coach — daily reviews & weekly summaries' },
  { icon: LightningIcon,    text: 'Unlimited journal history with rich-text editor' },
  { icon: Export,       text: 'Export data as PDF, CSV, or Excel' },
  { icon: PaletteIcon,      text: 'Premium themes — AMOLED, Ocean, Purple, Dracula' },
  { icon: ShieldCheck,  text: 'Priority support' },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Upgrade() {
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data: status } = useSubscriptionStatus();
  const createOrder  = useCreateOrder();
  const verifyPayment = useVerifyPayment();

  const monthly = PLANS.pro.price.monthly;
  const yearly  = PLANS.pro.price.yearly;
  const savedMonths = 12 - Math.round(yearly / monthly);

  const displayPrice = cycle === 'yearly'
    ? `₹${(yearly / 12).toFixed(0)}/mo`
    : `₹${monthly}/mo`;

  const billedAs = cycle === 'yearly'
    ? `₹${yearly} billed yearly (save ₹${12 * monthly - yearly})`
    : `₹${monthly} billed monthly`;

  const handleUpgrade = async () => {
    setError('');
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) { setError('Failed to load payment gateway. Please try again.'); return; }

      const order = await createOrder.mutateAsync(cycle);

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: APP_CONFIG.name,
        description: `Pro ${cycle === 'yearly' ? 'Yearly' : 'Monthly'} Plan`,
        order_id: order.orderId,
        prefill: { name: user?.name ?? '', email: user?.email ?? '' },
        theme: { color: '#6366f1' },
        handler: async (response) => {
          try {
            await verifyPayment.mutateAsync({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              billingCycle: cycle,
            });
            setSuccess(true);
          } catch {
            setError('Payment verification failed. Contact support if your amount was deducted.');
          }
        },
        modal: {
          ondismiss: () => { /* user closed modal — do nothing */ },
        },
      });

      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg.includes('503') ? 'Payment gateway is not configured yet. Contact support.' : 'Something went wrong. Please try again.');
    }
  };

  if (user?.plan === 'pro' || success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, textAlign: 'center' }}>
        <div style={{ background: 'color-mix(in srgb, var(--color-success) 15%, transparent)', borderRadius: '50%', padding: 20 }}>
          <CrownIcon size={40} weight="fill" color="var(--color-warning)" />
        </div>
        <h1 style={{ color: 'var(--color-text)', fontSize: '1.5rem', fontWeight: 700 }}>
          {success ? 'Welcome to Pro!' : 'You\'re already on Pro'}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', maxWidth: 360 }}>
          {success
            ? 'Your subscription is active. All Pro features are now unlocked.'
            : status?.planExpiresAt
              ? `Your plan is active until ${new Date(status.planExpiresAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}.`
              : 'Enjoy unlimited access to all features.'}
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 8 }}>
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Upgrade to Pro | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, maxWidth: 520, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <CrownIcon size={28} weight="fill" color="var(--color-warning)" />
            <h1 style={{ color: 'var(--color-text)', fontSize: '1.5rem', fontWeight: 700 }}>
              Upgrade to Pro
            </h1>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Unlock unlimited habits, AI coaching, advanced analytics, and more.
          </p>
        </div>

        {/* Billing toggle */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          padding: 4,
          gap: 4,
          alignSelf: 'center',
        }}>
          {(['monthly', 'yearly'] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              style={{
                background: cycle === c ? 'var(--color-accent)' : 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                color: cycle === c ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                minHeight: 'auto',
                padding: '6px 18px',
                transition: 'all 0.15s',
              }}
            >
              {c === 'yearly' ? `Yearly (save ${savedMonths} months)` : 'Monthly'}
            </button>
          ))}
        </div>

        {/* Price card */}
        <motion.div
          key={cycle}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{
            width: '100%',
            padding: '28px 24px',
            background: 'color-mix(in srgb, var(--color-accent) 5%, var(--color-surface))',
            borderColor: 'color-mix(in srgb, var(--color-accent) 40%, transparent)',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
          }}
        >
          {/* Price */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <span style={{ color: 'var(--color-text)', fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                {displayPrice}
              </span>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 4 }}>{billedAs}</p>
            {cycle === 'yearly' && (
              <span style={{
                display: 'inline-block', marginTop: 8,
                background: 'color-mix(in srgb, var(--color-success) 15%, transparent)',
                border: '1px solid color-mix(in srgb, var(--color-success) 30%, transparent)',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-success)',
                fontSize: '0.72rem', fontWeight: 600,
                padding: '2px 10px',
              }}>
                Save ₹{12 * monthly - yearly}
              </span>
            )}
          </div>

          {/* Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PRO_FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} style={{ alignItems: 'flex-start', display: 'flex', gap: 10 }}>
                <Icon size={17} weight="duotone" color="var(--color-accent)" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-danger) 30%, transparent)', borderRadius: 'var(--radius-md)', color: 'var(--color-danger)', fontSize: '0.8rem', padding: '10px 12px' }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleUpgrade}
            disabled={createOrder.isPending || verifyPayment.isPending}
            className="btn btn-primary"
            style={{ fontSize: '1rem', fontWeight: 600, padding: '12px', width: '100%' }}
          >
            {createOrder.isPending || verifyPayment.isPending
              ? 'Processing…'
              : `Upgrade Now — ${cycle === 'yearly' ? `₹${yearly}/yr` : `₹${monthly}/mo`}`}
          </motion.button>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20 }}>
            {['Cancel anytime', 'Instant activation', 'Secure payment'].map((t) => (
              <div key={t} style={{ alignItems: 'center', display: 'flex', gap: 4 }}>
                <StarIcon size={11} color="var(--color-text-muted)" />
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem' }}>{t}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}

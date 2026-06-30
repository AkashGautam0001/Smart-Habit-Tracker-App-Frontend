import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XIcon, CaretDownIcon, LightningIcon } from '@phosphor-icons/react';
import PublicNavbar from '../components/layout/PublicNavbar';
import { APP_CONFIG } from '../config/app.config';
import { PLANS } from '../config/plans.config';

const FEATURE_ROWS: { label: string; category?: string; free: boolean | string; pro: boolean | string }[] = [
  { category: 'Habits', label: '', free: '', pro: '' },
  { label: 'Daily habit tracking', free: true, pro: true },
  { label: 'Number of habits', free: '10 habits', pro: 'Unlimited' },
  { label: 'Habit streaks & calendar', free: true, pro: true },
  { label: 'Habit completion notes', free: false, pro: true },
  { label: 'Advanced frequency options', free: false, pro: true },
  { category: 'Pomodoro & Focus', label: '', free: '', pro: '' },
  { label: 'Pomodoro sessions', free: 'Unlimited', pro: 'Unlimited' },
  { label: 'Session history', free: '30 days', pro: 'Unlimited' },
  { label: 'Custom timer durations', free: true, pro: true },
  { label: 'Task linking & subjects', free: true, pro: true },
  { label: 'Focus Music (lo-fi, rain…)', free: false, pro: true },
  { category: 'Analytics', label: '', free: '', pro: '' },
  { label: 'Weekly analytics', free: true, pro: true },
  { label: 'Monthly & yearly reports', free: false, pro: true },
  { label: 'Subject-wise breakdown', free: false, pro: true },
  { label: 'GitHub-style heatmap (365 days)', free: false, pro: true },
  { label: 'Custom date range filters', free: false, pro: true },
  { category: 'AI Coach', label: '', free: '', pro: '' },
  { label: 'Daily AI review', free: false, pro: true },
  { label: 'Weekly AI analysis', free: false, pro: true },
  { label: 'AI Study Planner', free: false, pro: true },
  { category: 'More', label: '', free: '', pro: '' },
  { label: 'Journal entries', free: '1 per day', pro: 'Unlimited' },
  { label: 'Rich-text Markdown notes', free: false, pro: true },
  { label: 'Goals with milestones', free: '2 goals', pro: 'Unlimited' },
  { label: 'Task projects', free: false, pro: true },
  { label: 'Premium themes', free: false, pro: true },
  { label: 'Data export (CSV, PDF, Excel)', free: false, pro: true },
  { label: 'Cloud sync & PWA', free: true, pro: true },
];

const FAQS = [
  { q: 'Is the Free plan really free forever?', a: 'Yes. The core loop — habits, Pomodoro timer, tasks, and dashboard — will always be free. We only charge for power-user features like AI coaching, advanced analytics, unlimited history, and premium themes.' },
  { q: 'Can I cancel my Pro subscription anytime?', a: 'Absolutely. Cancel anytime from Settings → Subscription. Your Pro access remains active until the end of the current billing period. No questions asked.' },
  { q: 'What payment methods are accepted?', a: 'We use Razorpay, which supports UPI, debit cards, credit cards, net banking, and wallets. All standard Indian payment methods are supported.' },
  { q: 'Is my data safe?', a: 'Yes. All data is encrypted in transit (HTTPS) and at rest. We use MongoDB with proper access controls. We never sell your data. You can export or delete your data at any time.' },
  { q: 'Will HabitFlow work on my phone?', a: "Yes — it's a PWA (Progressive Web App). Install it from Chrome or Safari on your phone for an app-like experience with offline support." },
  { q: 'What happens to my data if I downgrade?', a: "Your data is safe. You just lose access to Pro features. If you re-upgrade later, everything is still there." },
];

function CheckCell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') {
    return <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>{value}</span>;
  }
  return value
    ? <CheckCircleIcon size={18} weight="fill" color="var(--color-success)" />
    : <XIcon size={16} weight="bold" color="var(--color-border)" />;
}

export default function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const monthlyEquiv = Math.round(PLANS.pro.price.yearly / 12);
  const savings = PLANS.pro.price.monthly * 12 - PLANS.pro.price.yearly;

  return (
    <>
      <Helmet>
        <title>Pricing | {APP_CONFIG.name}</title>
        <meta name="description" content={`${APP_CONFIG.name} pricing — Free plan forever, or upgrade to Pro for ₹${PLANS.pro.price.monthly}/month.`} />
        <link rel="canonical" href={`${APP_CONFIG.url}/pricing`} />
      </Helmet>

      <div style={{ background: 'var(--color-bg)', minHeight: '100dvh', width: '100%' }}>
        <PublicNavbar />

        {/* ─── Header ─── */}
        <section style={{ padding: '120px 24px 56px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <span style={{
              background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)',
              borderRadius: 99, color: 'var(--color-accent)',
              display: 'inline-block', fontSize: '0.72rem', fontWeight: 700,
              letterSpacing: '0.08em', marginBottom: 16, padding: '4px 14px', textTransform: 'uppercase',
            }}>
              Simple Pricing
            </span>

            <h1 style={{
              color: 'var(--color-text)', fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: 14,
            }}>
              Free to start.<br />Pro to unlock everything.
            </h1>

            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.7, margin: '0 auto 32px', maxWidth: 480 }}>
              No hidden fees. No feature gating on the core daily loop. Upgrade when you're ready to go deeper.
            </p>

            {/* Billing toggle */}
            <div style={{
              alignItems: 'center',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 10,
              display: 'inline-flex',
              gap: 0,
              padding: 4,
            }}>
              {(['monthly', 'yearly'] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  style={{
                    background: billing === b ? 'var(--color-accent)' : 'transparent',
                    border: 'none',
                    borderRadius: 7,
                    color: billing === b ? '#fff' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    padding: '8px 20px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {b === 'monthly' ? 'Monthly' : (
                    <span style={{ alignItems: 'center', display: 'inline-flex', gap: 8 }}>
                      Yearly
                      <span style={{ background: '#16a34a', borderRadius: 99, color: '#fff', fontSize: '0.62rem', fontWeight: 700, padding: '2px 8px' }}>
                        Save ₹{savings}
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── Plan cards ─── */}
        <section style={{ padding: '0 24px 72px' }}>
          <div style={{
            display: 'grid',
            gap: 20,
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            margin: '0 auto',
            maxWidth: 800,
          }}>
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
              className="card"
              style={{ padding: 28 }}
            >
              <div style={{ marginBottom: 20 }}>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Free</div>
                <div style={{ alignItems: 'baseline', display: 'flex', gap: 4 }}>
                  <span style={{ color: 'var(--color-text)', fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.04em' }}>₹0</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>/forever</span>
                </div>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.55, marginTop: 8 }}>
                  Everything you need to start building daily habits and focus sessions.
                </p>
              </div>

              <Link
                to="/register"
                className="btn btn-ghost"
                style={{ border: '1px solid var(--color-border)', display: 'block', marginBottom: 24, textAlign: 'center', width: '100%' }}
              >
                Get Started Free
              </Link>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['10 habits', 'Unlimited Pomodoro sessions', 'Daily tasks & subject tracking', 'Dashboard & weekly chart', '2 goals', 'Cloud sync & PWA'].map((f) => (
                  <div key={f} style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
                    <CheckCircleIcon size={16} weight="fill" color="var(--color-success)" style={{ flexShrink: 0 }} />
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{f}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid color-mix(in srgb, var(--color-accent) 45%, transparent)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 0 48px color-mix(in srgb, var(--color-accent) 10%, transparent)',
                padding: 28,
                position: 'relative',
              }}
            >
              {/* Badge */}
              <div style={{ position: 'absolute', right: 20, top: -1 }}>
                <div style={{
                  background: 'var(--color-accent)',
                  borderRadius: '0 0 10px 10px',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  padding: '4px 14px',
                  textTransform: 'uppercase',
                }}>
                  Most Popular
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ color: 'var(--color-accent)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 8, textTransform: 'uppercase' }}>Pro</div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={billing}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div style={{ alignItems: 'baseline', display: 'flex', gap: 4 }}>
                      <span style={{ color: 'var(--color-text)', fontSize: '2.6rem', fontWeight: 800, letterSpacing: '-0.04em' }}>
                        ₹{billing === 'monthly' ? PLANS.pro.price.monthly : monthlyEquiv}
                      </span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>/month</span>
                    </div>
                    {billing === 'yearly' && (
                      <p style={{ color: 'var(--color-success)', fontSize: '0.8rem', marginTop: 4 }}>
                        Billed ₹{PLANS.pro.price.yearly}/year · You save ₹{savings}
                      </p>
                    )}
                  </motion.div>
                </AnimatePresence>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', lineHeight: 1.55, marginTop: 8 }}>
                  Unlimited everything, AI coaching, and advanced analytics for serious learners.
                </p>
              </div>

              <Link
                to="/register"
                className="btn btn-primary"
                style={{ display: 'flex', fontSize: '0.95rem', marginBottom: 24, width: '100%' }}
              >
                <LightningIcon size={16} weight="fill" />
                Start Pro Free Trial
              </Link>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'Everything in Free',
                  'Unlimited habits & history',
                  'Advanced analytics & heatmap',
                  'AI daily review + weekly plan',
                  'AI Study Planner',
                  'Unlimited goals & projects',
                  'Focus Music (lo-fi, rain, forest)',
                  'Premium themes (AMOLED, Dracula…)',
                  'Data export (PDF, CSV, Excel)',
                  'Unlimited journal + rich-text notes',
                ].map((f, i) => (
                  <div key={f} style={{ alignItems: 'center', display: 'flex', gap: 10 }}>
                    <CheckCircleIcon size={16} weight="fill" color="var(--color-accent)" style={{ flexShrink: 0 }} />
                    <span style={{
                      color: i === 0 ? 'var(--color-text)' : 'var(--color-text-secondary)',
                      fontSize: '0.85rem',
                      fontWeight: i === 0 ? 600 : 400,
                    }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── Full comparison table ─── */}
        <section style={{ padding: '0 24px 72px' }}>
          <div style={{ margin: '0 auto', maxWidth: 860 }}>
            <h2 style={{ color: 'var(--color-text)', fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>
              Full Plan Comparison
            </h2>
            <div className="card" style={{ overflow: 'hidden' }}>
              <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: 'var(--color-surface-hover)' }}>
                    <th style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', fontWeight: 600, padding: '12px 20px', textAlign: 'left', width: '56%' }}>Feature</th>
                    <th style={{ color: 'var(--color-text)', fontSize: '0.82rem', fontWeight: 600, padding: '12px 20px', textAlign: 'center' }}>Free</th>
                    <th style={{ color: 'var(--color-accent)', fontSize: '0.82rem', fontWeight: 700, padding: '12px 20px', textAlign: 'center' }}>Pro</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_ROWS.map((row, i) => {
                    if (row.category) return (
                      <tr key={row.category + i} style={{ background: 'color-mix(in srgb, var(--color-surface-hover) 60%, transparent)' }}>
                        <td colSpan={3} style={{ color: 'var(--color-text-secondary)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', padding: '10px 20px', textTransform: 'uppercase' }}>
                          {row.category}
                        </td>
                      </tr>
                    );
                    return (
                      <tr key={row.label + i} style={{ borderTop: '1px solid var(--color-border)' }}>
                        <td style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', padding: '11px 20px' }}>{row.label}</td>
                        <td style={{ padding: '11px 20px', textAlign: 'center' }}><CheckCell value={row.free} /></td>
                        <td style={{ padding: '11px 20px', textAlign: 'center' }}><CheckCell value={row.pro} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '72px 24px' }}>
          <div style={{ margin: '0 auto', maxWidth: 680 }}>
            <h2 style={{ color: 'var(--color-text)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 28, textAlign: 'center' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAQS.map((faq, i) => (
                <motion.div key={i} className="card" style={{ overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 12,
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      width: '100%',
                    }}
                  >
                    <span style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 500, textAlign: 'left' }}>
                      {faq.q}
                    </span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.2 }} style={{ flexShrink: 0 }}>
                      <CaretDownIcon size={16} color="var(--color-text-muted)" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.7, padding: '14px 20px 18px' }}>
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section style={{ padding: '72px 24px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 style={{ color: 'var(--color-text)', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Start Free, Upgrade When Ready
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, margin: '0 auto 28px', maxWidth: 420 }}>
              No credit card required. Build your habit streak first — upgrade when you need the power-user features.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '11px 28px' }}>
                Create Free Account
              </Link>
              <Link to="/login" className="btn btn-ghost" style={{ border: '1px solid var(--color-border)', fontSize: '1rem', padding: '11px 24px' }}>
                Sign In
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ─── Footer ─── */}
        <footer style={{ borderTop: '1px solid var(--color-border)', padding: '28px 24px' }}>
          <div style={{
            alignItems: 'center',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            justifyContent: 'space-between',
            margin: '0 auto',
            maxWidth: 1080,
          }}>
            <Link to="/" style={{ color: 'var(--color-accent)', fontWeight: 700, textDecoration: 'none' }}>
              {APP_CONFIG.name}
            </Link>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>
              © {new Date().getFullYear()} {APP_CONFIG.name}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

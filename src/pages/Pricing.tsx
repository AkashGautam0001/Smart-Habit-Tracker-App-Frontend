import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircleIcon, XIcon, CaretDownIcon, LightningIcon } from '@phosphor-icons/react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
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
    return <span className="text-[0.82rem] text-muted-foreground">{value}</span>;
  }
  return value
    ? <CheckCircleIcon size={18} weight="fill" className="text-green-500" />
    : <XIcon size={16} weight="bold" className="text-border" />;
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

      <div className="min-h-dvh w-full bg-background">
        <PublicNavbar />

        {/* ─── Header ─── */}
        <section className="px-6 pt-[120px] pb-14 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Badge
              variant="outline"
              className="mb-4 border-primary/30 bg-primary/10 px-3.5 py-1 text-[0.72rem] font-bold uppercase tracking-wider text-primary"
            >
              Simple Pricing
            </Badge>

            <h1 className="mb-3.5 text-[clamp(2rem,5vw,3rem)] leading-tight font-extrabold tracking-tight text-foreground">
              Free to start.<br />Pro to unlock everything.
            </h1>

            <p className="mx-auto mb-8 max-w-[480px] text-base leading-relaxed text-muted-foreground">
              No hidden fees. No feature gating on the core daily loop. Upgrade when you're ready to go deeper.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex rounded-[10px] border border-border bg-card p-1">
              {(['monthly', 'yearly'] as const).map((b) => (
                <Button
                  key={b}
                  variant={billing === b ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setBilling(b)}
                  className="rounded-md px-5"
                >
                  {b === 'monthly' ? 'Monthly' : (
                    <span className="inline-flex items-center gap-2">
                      Yearly
                      <Badge className="border-0 bg-green-600 px-2 py-0 text-[0.62rem] font-bold text-white">
                        Save ₹{savings}
                      </Badge>
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ─── Plan cards ─── */}
        <section className="px-6 pb-[72px]">
          <div className="mx-auto grid max-w-[800px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
            {/* Free */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="h-full py-0">
                <CardContent className="p-7">
                  <div className="mb-5">
                    <div className="mb-2 text-[0.75rem] font-semibold uppercase tracking-wider text-muted-foreground">
                      Free
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[2.6rem] font-extrabold tracking-tight text-foreground">₹0</span>
                      <span className="text-[0.82rem] text-muted-foreground">/forever</span>
                    </div>
                    <p className="mt-2 text-[0.85rem] leading-snug text-muted-foreground">
                      Everything you need to start building daily habits and focus sessions.
                    </p>
                  </div>

                  <Button variant="outline" className="mb-6 w-full" asChild>
                    <Link to="/register">Get Started Free</Link>
                  </Button>

                  <div className="flex flex-col gap-2.5">
                    {['10 habits', 'Unlimited Pomodoro sessions', 'Daily tasks & subject tracking', 'Dashboard & weekly chart', '2 goals', 'Cloud sync & PWA'].map((f) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <CheckCircleIcon size={16} weight="fill" className="shrink-0 text-green-500" />
                        <span className="text-[0.85rem] text-muted-foreground">{f}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative h-full border-primary/45 py-0 shadow-[0_0_48px] shadow-primary/10">
                <div className="absolute top-0 right-5">
                  <Badge className="rounded-t-none rounded-b-[10px] border-0 bg-primary px-3.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-primary-foreground">
                    Most Popular
                  </Badge>
                </div>

                <CardContent className="p-7">
                  <div className="mb-5">
                    <div className="mb-2 text-[0.75rem] font-bold uppercase tracking-wider text-primary">
                      Pro
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={billing}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="flex items-baseline gap-1">
                          <span className="text-[2.6rem] font-extrabold tracking-tight text-foreground">
                            ₹{billing === 'monthly' ? PLANS.pro.price.monthly : monthlyEquiv}
                          </span>
                          <span className="text-[0.82rem] text-muted-foreground">/month</span>
                        </div>
                        {billing === 'yearly' && (
                          <p className="mt-1 text-[0.8rem] text-green-500">
                            Billed ₹{PLANS.pro.price.yearly}/year · You save ₹{savings}
                          </p>
                        )}
                      </motion.div>
                    </AnimatePresence>
                    <p className="mt-2 text-[0.85rem] leading-snug text-muted-foreground">
                      Unlimited everything, AI coaching, and advanced analytics for serious learners.
                    </p>
                  </div>

                  <Button className="mb-6 w-full gap-2 text-[0.95rem]" asChild>
                    <Link to="/register">
                      <LightningIcon size={16} weight="fill" />
                      Start Pro Free Trial
                    </Link>
                  </Button>

                  <div className="flex flex-col gap-2.5">
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
                      <div key={f} className="flex items-center gap-2.5">
                        <CheckCircleIcon size={16} weight="fill" className="shrink-0 text-primary" />
                        <span
                          className={cn(
                            'text-[0.85rem]',
                            i === 0 ? 'font-semibold text-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {f}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* ─── Full comparison table ─── */}
        <section className="px-6 pb-[72px]">
          <div className="mx-auto max-w-[860px]">
            <h2 className="mb-5 text-center text-xl font-bold text-foreground">
              Full Plan Comparison
            </h2>
            <Card className="overflow-hidden py-0">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="w-[56%] px-5 py-3 text-left text-[0.78rem] font-semibold text-muted-foreground">
                        Feature
                      </th>
                      <th className="px-5 py-3 text-center text-[0.82rem] font-semibold text-foreground">
                        Free
                      </th>
                      <th className="px-5 py-3 text-center text-[0.82rem] font-bold text-primary">
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {FEATURE_ROWS.map((row, i) => {
                      if (row.category) {
                        return (
                          <tr key={row.category + i} className="bg-secondary/60">
                            <td
                              colSpan={3}
                              className="px-5 py-2.5 text-[0.72rem] font-bold uppercase tracking-wider text-muted-foreground"
                            >
                              {row.category}
                            </td>
                          </tr>
                        );
                      }
                      return (
                        <tr key={row.label + i} className="border-t border-border">
                          <td className="px-5 py-[11px] text-[0.85rem] text-muted-foreground">
                            {row.label}
                          </td>
                          <td className="px-5 py-[11px] text-center">
                            <CheckCell value={row.free} />
                          </td>
                          <td className="px-5 py-[11px] text-center">
                            <CheckCell value={row.pro} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </section>

        {/* ─── FAQ ─── */}
        <section className="border-t border-border bg-card px-6 py-[72px]">
          <div className="mx-auto max-w-[680px]">
            <h2 className="mb-7 text-center text-[1.6rem] font-bold tracking-tight text-foreground">
              Frequently Asked Questions
            </h2>
            <div className="flex flex-col gap-2">
              {FAQS.map((faq, i) => (
                <motion.div key={i}>
                  <Card className="overflow-hidden py-0">
                    <Button
                      variant="ghost"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="h-auto w-full justify-between gap-3 px-5 py-4 text-left font-normal hover:bg-transparent"
                    >
                      <span className="text-[0.875rem] font-medium text-foreground">
                        {faq.q}
                      </span>
                      <motion.div
                        animate={{ rotate: openFaq === i ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="shrink-0"
                      >
                        <CaretDownIcon size={16} className="text-muted-foreground" />
                      </motion.div>
                    </Button>
                    <AnimatePresence initial={false}>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="border-t border-border px-5 pt-3.5 pb-[18px] text-[0.875rem] leading-relaxed text-muted-foreground">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Final CTA ─── */}
        <section className="px-6 py-[72px] text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-3 text-[clamp(1.5rem,3vw,2.2rem)] font-bold tracking-tight text-foreground">
              Start Free, Upgrade When Ready
            </h2>
            <p className="mx-auto mb-7 max-w-[420px] text-[0.95rem] leading-relaxed text-muted-foreground">
              No credit card required. Build your habit streak first — upgrade when you need the power-user features.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="px-7 text-base" asChild>
                <Link to="/register">Create Free Account</Link>
              </Button>
              <Button variant="outline" size="lg" className="px-6 text-base" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* ─── Footer ─── */}
        <footer className="border-t border-border px-6 py-7">
          <div className="mx-auto flex max-w-[1080px] flex-wrap items-center justify-between gap-3">
            <Link to="/" className="font-bold text-primary no-underline">
              {APP_CONFIG.name}
            </Link>
            <p className="text-[0.78rem] text-muted-foreground">
              © {new Date().getFullYear()} {APP_CONFIG.name}
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

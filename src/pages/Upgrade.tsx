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
import PageShell from '@/components/shared/PageShell';
import PageHeader from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
      <PageShell narrow className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-green-500/15 p-5">
          <CrownIcon size={40} weight="fill" className="text-amber-500" />
        </div>
        <PageHeader
          className="flex-col items-center text-center"
          title={success ? 'Welcome to Pro!' : "You're already on Pro"}
          description={
            success
              ? 'Your subscription is active. All Pro features are now unlocked.'
              : status?.planExpiresAt
                ? `Your plan is active until ${new Date(status.planExpiresAt).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}.`
                : 'Enjoy unlimited access to all features.'
          }
        />
        <Button className="mt-2" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </PageShell>
    );
  }

  return (
    <>
      <Helmet>
        <title>Upgrade to Pro | {APP_CONFIG.name}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <PageShell narrow className="mx-auto flex max-w-[520px] flex-col items-center gap-8">
        <div className="text-center">
          <div className="mb-2 inline-flex items-center justify-center gap-2">
            <CrownIcon size={28} weight="fill" className="text-amber-500" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Upgrade to Pro</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Unlock unlimited habits, AI coaching, advanced analytics, and more.
          </p>
        </div>

        <Tabs
          value={cycle}
          onValueChange={(v) => setCycle(v as 'monthly' | 'yearly')}
          className="self-center"
        >
          <TabsList className="rounded-full">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly (save {savedMonths} months)
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <motion.div
          key={cycle}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <Card className="w-full border-primary/40 bg-primary/5 py-0">
            <CardContent className="flex flex-col gap-5 px-6 py-7">
              <div className="text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {displayPrice}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{billedAs}</p>
                {cycle === 'yearly' && (
                  <Badge
                    variant="secondary"
                    className="mt-2 border border-green-500/30 bg-green-500/15 text-green-500"
                  >
                    Save ₹{12 * monthly - yearly}
                  </Badge>
                )}
              </div>

              <div className="flex flex-col gap-2.5">
                {PRO_FEATURES.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-2.5">
                    <Icon size={17} weight="duotone" className="mt-0.5 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{text}</span>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-xs text-destructive"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button
                size="lg"
                className="w-full text-base font-semibold"
                onClick={handleUpgrade}
                disabled={createOrder.isPending || verifyPayment.isPending}
              >
                {createOrder.isPending || verifyPayment.isPending
                  ? 'Processing…'
                  : `Upgrade Now — ${cycle === 'yearly' ? `₹${yearly}/yr` : `₹${monthly}/mo`}`}
              </Button>

              <div className="flex justify-center gap-5">
                {['Cancel anytime', 'Instant activation', 'Secure payment'].map((t) => (
                  <div key={t} className="flex items-center gap-1">
                    <StarIcon size={11} className="text-muted-foreground" />
                    <span className="text-[0.7rem] text-muted-foreground">{t}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </PageShell>
    </>
  );
}

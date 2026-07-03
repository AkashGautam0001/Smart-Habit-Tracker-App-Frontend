import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@phosphor-icons/react';
import { Loader2Icon } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { APP_CONFIG } from '../config/app.config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import FormError from '@/components/shared/FormError';
import PasswordField from '@/components/shared/PasswordField';

const perks = ['Unlimited Pomodoro sessions', 'Habit streaks & calendar', 'Cloud sync across devices', 'Free forever — no credit card'];

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(form);
      const { user, accessToken } = res.data.data;
      setAuth(user, accessToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account | {APP_CONFIG.name}</title>
      </Helmet>

      <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          <div className="mb-7 text-center">
            <div className="text-3xl font-bold tracking-tight text-primary">
              {APP_CONFIG.name}
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Start tracking habits and building focus for free
            </p>
          </div>

          <div className="mb-5 flex flex-col gap-1.5">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2">
                <CheckCircleIcon size={16} weight="fill" className="text-chart-2" />
                <span className="text-sm text-muted-foreground">{perk}</span>
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-7">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Akash"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    required
                    autoComplete="email"
                  />
                </div>

                <PasswordField
                  id="password"
                  label="Password"
                  value={form.password}
                  onChange={(password) => setForm((f) => ({ ...f, password }))}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  hint={
                    form.password && form.password.length < 8
                      ? 'At least 8 characters required'
                      : undefined
                  }
                />

                {error && <FormError message={error} />}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    'Create Free Account'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}

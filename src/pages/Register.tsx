import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { APP_CONFIG } from '../config/app.config';

const perks = ['Unlimited Pomodoro sessions', 'Habit streaks & calendar', 'Cloud sync across devices', 'Free forever — no credit card'];

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

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

      <div style={{
        alignItems: 'center', background: 'var(--color-bg)',
        display: 'flex', justifyContent: 'center',
        minHeight: '100dvh', padding: '24px 16px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          style={{ width: '100%', maxWidth: 420 }}
        >
          {/* Logo */}
          <div style={{ marginBottom: 28, textAlign: 'center' }}>
            <div style={{ color: 'var(--color-accent)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.04em', marginBottom: 6 }}>
              {APP_CONFIG.name}
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              Start tracking habits and building focus for free
            </p>
          </div>

          {/* Perks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {perks.map((perk) => (
              <div key={perk} style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
                <CheckCircleIcon size={16} weight="fill" color="var(--color-success)" />
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.82rem' }}>{perk}</span>
              </div>
            ))}
          </div>

          {/* Card */}
          <div className="card" style={{ padding: 28 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Name */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6 }}>
                  Your Name
                </label>
                <input
                  className="input"
                  type="text"
                  placeholder="Akash"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  autoComplete="name"
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6 }}>
                  Email
                </label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <label style={{ color: 'var(--color-text-secondary)', display: 'block', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6 }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    autoComplete="new-password"
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--color-text-muted)', padding: 0, minHeight: 'auto', minWidth: 'auto',
                    }}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {form.password && form.password.length < 8 && (
                  <p style={{ color: 'var(--color-danger)', fontSize: '0.75rem', marginTop: 4 }}>
                    At least 8 characters required
                  </p>
                )}
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ background: 'color-mix(in srgb, var(--color-danger) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--color-danger) 25%, transparent)', borderRadius: 8, color: 'var(--color-danger)', fontSize: '0.82rem', padding: '10px 12px' }}
                >
                  {error}
                </motion.p>
              )}

              {/* Submit */}
              <motion.button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                style={{ marginTop: 4, width: '100%', fontSize: '0.95rem' }}
              >
                {loading ? (
                  <span style={{ alignItems: 'center', display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <span style={{ animation: 'spin 0.8s linear infinite', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '50%', borderTopColor: '#fff', display: 'inline-block', height: 16, width: 16 }} />
                    Creating account…
                  </span>
                ) : 'Create Free Account'}
              </motion.button>
            </form>
          </div>

          {/* Terms */}
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginTop: 12, textAlign: 'center', lineHeight: 1.5 }}>
            By creating an account you agree to our Terms of Service and Privacy Policy.
          </p>

          {/* Login link */}
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: 16, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent)', fontWeight: 500, textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}

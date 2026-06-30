import type { PomodoroSession } from '../../types';

interface Props {
  session: PomodoroSession;
}

export default function SessionCard({ session }: Props) {
  const start = new Date(session.startTime);
  const time = start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

  return (
    <div style={{
      alignItems: 'center', display: 'flex', gap: 12,
      padding: '10px 14px',
      borderBottom: '1px solid var(--color-border)',
    }}>
      <span style={{ fontSize: '1rem' }}>🍅</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 500 }}>
          {session.subject || 'General Focus'}
        </div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', marginTop: 1 }}>
          {time} · {session.duration ?? 0} min
        </div>
      </div>

      <div style={{
        background: session.wasCompleted
          ? 'color-mix(in srgb, var(--color-success) 12%, transparent)'
          : 'color-mix(in srgb, var(--color-text-muted) 10%, transparent)',
        borderRadius: 6,
        color: session.wasCompleted ? 'var(--color-success)' : 'var(--color-text-muted)',
        fontSize: '0.7rem', fontWeight: 600,
        padding: '2px 8px',
      }}>
        {session.wasCompleted ? 'Done' : 'Stopped'}
      </div>
    </div>
  );
}

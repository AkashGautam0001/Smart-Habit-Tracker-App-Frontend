import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

export interface SubjectData {
  subject: string;
  minutes: number;
  sessions: number;
  pct: number;
}

interface Props {
  subjects: SubjectData[];
  totalMinutes: number;
}

const PALETTE = ['#6366f1', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4'];

function fmt(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  return h > 0 ? `${h}h` : `${m}m`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: { payload: SubjectData }[];
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const s = payload[0].payload;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: '0.78rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>{s.subject}</div>
      <div style={{ color: 'var(--color-text-secondary)' }}>{fmt(s.minutes)} · {s.pct}%</div>
      <div style={{ color: 'var(--color-text-muted)' }}>{s.sessions} session{s.sessions !== 1 ? 's' : ''}</div>
    </div>
  );
}

export default function SubjectDonut({ subjects, totalMinutes }: Props) {
  if (subjects.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 200, gap: 8 }}>
        <div style={{ fontSize: '1.6rem', opacity: 0.3 }}>📚</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)' }}>No session data yet</div>
      </div>
    );
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={subjects}
            dataKey="minutes"
            nameKey="subject"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={subjects.length > 1 ? 2 : 0}
          >
            {subjects.map((_, i) => (
              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
        {subjects.slice(0, 6).map((s, i) => (
          <div key={s.subject} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.81rem' }}>
            <div style={{ width: 9, height: 9, borderRadius: 2, background: PALETTE[i % PALETTE.length], flexShrink: 0 }} />
            <span style={{ flex: 1, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {s.subject}
            </span>
            <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{fmt(s.minutes)}</span>
            <span style={{ color: 'var(--color-text-muted)', minWidth: 34, textAlign: 'right' }}>{s.pct}%</span>
          </div>
        ))}
      </div>

      {totalMinutes > 0 && (
        <div style={{ marginTop: 10, fontSize: '0.76rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Total: {fmt(totalMinutes)} across {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export interface HourData {
  hour: number;
  sessions: number;
  minutes: number;
}

interface Props {
  hours: HourData[];
}

const SHOW = new Set([0, 3, 6, 9, 12, 15, 18, 21]);

function fmtHour(h: number): string {
  if (h === 0)   return '12A';
  if (h < 12)   return `${h}A`;
  if (h === 12)  return '12P';
  return `${h - 12}P`;
}

interface TT { active?: boolean; payload?: { payload: HourData }[] }

function ChartTooltip({ active, payload }: TT) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const h = d.hour;
  const label = h === 0 ? '12:00 AM' : h < 12 ? `${h}:00 AM` : h === 12 ? '12:00 PM' : `${h - 12}:00 PM`;
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: '0.78rem',
      boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: 2 }}>{label}</div>
      <div style={{ color: 'var(--color-text-secondary)' }}>{d.sessions} session{d.sessions !== 1 ? 's' : ''}</div>
      {d.minutes > 0 && <div style={{ color: 'var(--color-text-muted)' }}>{d.minutes} min total</div>}
    </div>
  );
}

export default function BestHoursChart({ hours }: Props) {
  const maxSessions = Math.max(...hours.map((h) => h.sessions), 1);

  if (hours.every((h) => h.sessions === 0)) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, gap: 8 }}>
        <div style={{ fontSize: '1.6rem', opacity: 0.3 }}>🕐</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)' }}>No sessions yet</div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={hours} barCategoryGap="10%" margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="hour"
          tickFormatter={(h) => (SHOW.has(h) ? fmtHour(h) : '')}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <YAxis hide />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 4 }} />
        <Bar dataKey="sessions" radius={[3, 3, 0, 0]}>
          {hours.map((h, i) => (
            <Cell
              key={i}
              fill={
                h.sessions === maxSessions && h.sessions > 0
                  ? '#6366f1'
                  : h.sessions > 0
                    ? 'rgba(99,102,241,0.4)'
                    : 'var(--color-surface-hover)'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

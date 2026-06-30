import { FireIcon } from '@phosphor-icons/react';

interface Props {
  streak: number;
  size?: 'sm' | 'md';
}

export default function StreakBadge({ streak, size = 'md' }: Props) {
  if (!streak) return null;

  const iconSize = size === 'sm' ? 14 : 16;
  const fontSize = size === 'sm' ? '0.72rem' : '0.8rem';

  return (
    <span style={{
      alignItems: 'center', display: 'inline-flex', gap: 3,
      background: 'color-mix(in srgb, #f97316 12%, transparent)',
      border: '1px solid color-mix(in srgb, #f97316 25%, transparent)',
      borderRadius: 99, padding: size === 'sm' ? '2px 7px' : '3px 9px',
    }}>
      <FireIcon size={iconSize} weight="fill" color="#f97316" />
      <span style={{ color: '#f97316', fontSize, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {streak}
      </span>
    </span>
  );
}

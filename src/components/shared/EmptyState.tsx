import * as Icons from '@phosphor-icons/react';

interface Props {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

function NavIcon({ name, ...props }: { name: string; [k: string]: unknown }) {
  const Icon = (Icons as unknown as Record<string, React.ElementType>)[name];
  return Icon ? <Icon {...props} /> : null;
}

export default function EmptyState({ icon = 'Ghost', title, description, action }: Props) {
  return (
    <div style={{
      alignItems: 'center', display: 'flex', flexDirection: 'column',
      gap: 12, padding: '48px 24px', textAlign: 'center',
    }}>
      <div style={{
        alignItems: 'center',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '50%',
        display: 'flex',
        height: 64, justifyContent: 'center', width: 64,
      }}>
        <NavIcon name={icon} size={32} weight="duotone" color="var(--color-text-muted)" />
      </div>
      <div>
        <h3 style={{ color: 'var(--color-text)', fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{title}</h3>
        {description && (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{description}</p>
        )}
      </div>
      {action && (
        <button className="btn btn-primary" onClick={action.onClick} style={{ marginTop: 4 }}>
          {action.label}
        </button>
      )}
    </div>
  );
}

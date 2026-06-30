import { NavLink } from 'react-router-dom';
import * as Icons from '@phosphor-icons/react';
import { MOBILE_NAV_ITEMS } from '../../config/nav.config';

function NavIcon({ name, ...props }: { name: string; [k: string]: unknown }) {
  const Icon = (Icons as unknown as Record<string, React.ElementType>)[name];
  return Icon ? <Icon {...props} /> : null;
}

export default function BottomNav() {
  return (
    <nav style={{
      background: 'var(--color-surface)',
      borderTop: '1px solid var(--color-border)',
      bottom: 0,
      display: 'flex',
      left: 0,
      paddingBottom: 'var(--safe-bottom)',
      position: 'fixed',
      right: 0,
      zIndex: 50,
    }}>
      {MOBILE_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          style={({ isActive }) => ({
            alignItems: 'center',
            color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
            display: 'flex',
            flex: 1,
            flexDirection: 'column' as const,
            fontSize: '0.65rem',
            fontWeight: isActive ? 600 : 400,
            gap: 3,
            justifyContent: 'center',
            minHeight: 56,
            padding: '6px 4px',
            textDecoration: 'none',
            transition: 'color 150ms ease',
          })}
        >
          {({ isActive }) => (
            <>
              <NavIcon
                name={item.icon}
                size={22}
                weight={isActive ? 'fill' : 'regular'}
                color={isActive ? 'var(--color-accent)' : 'var(--color-text-muted)'}
              />
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

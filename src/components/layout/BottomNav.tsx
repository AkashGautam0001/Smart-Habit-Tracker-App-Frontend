import { NavLink } from 'react-router-dom';
import { MOBILE_NAV_ITEMS } from '../../config/nav.config';
import NavIcon from './NavIcon';
import { cn } from '@/lib/utils';

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card/95 pb-[var(--safe-bottom)] backdrop-blur-sm">
      {MOBILE_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[0.65rem] transition-colors',
              isActive
                ? 'font-medium text-primary'
                : 'font-normal text-muted-foreground',
            )
          }
        >
          {({ isActive }) => (
            <>
              <NavIcon
                name={item.icon}
                size={22}
                weight={isActive ? 'fill' : 'regular'}
                className={isActive ? 'text-primary' : 'text-muted-foreground'}
              />
              <span>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

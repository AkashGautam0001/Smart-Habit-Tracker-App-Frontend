export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  mobileShow: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    path: '/dashboard',    icon: 'SquaresFour',   mobileShow: true },
  { id: 'habits',       label: 'Habits',       path: '/habits',       icon: 'CheckSquare',   mobileShow: true },
  { id: 'focus',        label: 'Focus',        path: '/focus',        icon: 'Timer',         mobileShow: true },
  { id: 'tasks',        label: 'Tasks',        path: '/tasks',        icon: 'ListChecks',    mobileShow: true },
  { id: 'analytics',   label: 'Analytics',    path: '/analytics',    icon: 'ChartBar',      mobileShow: true },
  { id: 'calendar',    label: 'Calendar',     path: '/calendar',     icon: 'CalendarBlank', mobileShow: false },
  { id: 'goals',       label: 'Goals',        path: '/goals',        icon: 'Target',        mobileShow: false },
  { id: 'projects',    label: 'Projects',     path: '/projects',     icon: 'FolderOpen',    mobileShow: false },
  { id: 'journal',     label: 'Journal',      path: '/journal',      icon: 'NotePencil',    mobileShow: false },
  { id: 'achievements',label: 'Achievements', path: '/achievements', icon: 'Trophy',        mobileShow: false },
  { id: 'settings',    label: 'Settings',     path: '/settings',     icon: 'Gear',          mobileShow: false },
];

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.mobileShow);

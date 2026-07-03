export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  mobileShow: boolean;
  group: string;
}

export interface NavGroup {
  id: string;
  label: string;
}

export const NAV_GROUPS: NavGroup[] = [
  { id: 'main',         label: 'Main' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'insights',     label: 'Insights' },
  { id: 'personal',     label: 'Personal' },
];

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    path: '/dashboard',    icon: 'SquaresFour',   mobileShow: true,  group: 'main' },
  { id: 'habits',       label: 'Habits',       path: '/habits',       icon: 'CheckSquare',   mobileShow: true,  group: 'productivity' },
  { id: 'focus',        label: 'Focus',        path: '/focus',        icon: 'Timer',         mobileShow: true,  group: 'productivity' },
  { id: 'tasks',        label: 'Tasks',        path: '/tasks',        icon: 'ListChecks',    mobileShow: true,  group: 'productivity' },
  { id: 'analytics',    label: 'Analytics',    path: '/analytics',    icon: 'ChartBar',      mobileShow: true,  group: 'insights' },
  { id: 'calendar',     label: 'Calendar',     path: '/calendar',     icon: 'CalendarBlank', mobileShow: false, group: 'insights' },
  { id: 'goals',        label: 'Goals',        path: '/goals',        icon: 'Target',        mobileShow: false, group: 'personal' },
  { id: 'projects',     label: 'Projects',     path: '/projects',     icon: 'FolderOpen',    mobileShow: false, group: 'personal' },
  { id: 'journal',      label: 'Journal',      path: '/journal',      icon: 'NotePencil',    mobileShow: false, group: 'personal' },
  { id: 'achievements', label: 'Achievements', path: '/achievements', icon: 'Trophy',        mobileShow: false, group: 'personal' },
];

export const MOBILE_NAV_ITEMS = NAV_ITEMS.filter((item) => item.mobileShow);

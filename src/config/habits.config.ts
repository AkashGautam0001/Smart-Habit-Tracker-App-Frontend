export interface HabitCategory {
  id: string;
  label: string;
  icon: string;
  color: string;
}

export const HABIT_CATEGORIES: HabitCategory[] = [
  { id: 'fitness',    label: 'Fitness',    icon: 'Barbell',     color: '#f97316' },
  { id: 'learning',  label: 'Learning',   icon: 'BookOpen',    color: '#6366f1' },
  { id: 'health',    label: 'Health',     icon: 'Heart',       color: '#22c55e' },
  { id: 'finance',   label: 'Finance',    icon: 'Money',       color: '#f59e0b' },
  { id: 'creativity',label: 'Creativity', icon: 'PaintBrush',  color: '#ec4899' },
  { id: 'coding',    label: 'Coding',     icon: 'Code',        color: '#3b82f6' },
  { id: 'mindfulness',label: 'Mindfulness',icon: 'Leaf',       color: '#10b981' },
  { id: 'social',    label: 'Social',     icon: 'Users',       color: '#a855f7' },
  { id: 'other',     label: 'Other',      icon: 'Star',        color: '#71717a' },
];

export type HabitTargetType = 'yes_no' | 'number' | 'timer';

export const TARGET_TYPES = [
  { id: 'yes_no' as HabitTargetType,  label: 'Yes / No',    description: 'Did you do it today?' },
  { id: 'number' as HabitTargetType,  label: 'Count',       description: 'Track a number (glasses of water, pages, etc.)' },
  { id: 'timer' as HabitTargetType,   label: 'Duration',    description: 'Track time spent (minutes)' },
];

export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';

export const FREQUENCY_OPTIONS = [
  { id: 'daily' as HabitFrequency,     label: 'Every day',        days: [0, 1, 2, 3, 4, 5, 6] },
  { id: 'weekdays' as HabitFrequency,  label: 'Weekdays only',    days: [1, 2, 3, 4, 5] },
  { id: 'weekends' as HabitFrequency,  label: 'Weekends only',    days: [0, 6] },
  { id: 'custom' as HabitFrequency,    label: 'Custom days',      days: [] },
];

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const HABIT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f59e0b', '#22c55e', '#10b981',
  '#06b6d4', '#3b82f6', '#a855f7', '#71717a',
];

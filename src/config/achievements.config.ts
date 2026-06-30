export type AchievementCategory = 'habits' | 'focus' | 'tasks' | 'milestones' | 'special';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Habits
  { id: 'first_habit',  title: 'First Steps',         description: 'Complete your first habit.',                  icon: 'CheckCircle', category: 'habits',     xpReward: 50 },
  { id: 'habit_10',     title: 'Getting Consistent',  description: 'Complete 10 habits total.',                   icon: 'Repeat',      category: 'habits',     xpReward: 100 },
  { id: 'habit_100',    title: 'Habit Machine',        description: 'Complete 100 habits total.',                  icon: 'Lightning',   category: 'habits',     xpReward: 250 },
  { id: 'habit_500',    title: 'Iron Will',            description: 'Complete 500 habits total.',                  icon: 'Barbell',     category: 'habits',     xpReward: 500 },
  { id: 'streak_7',     title: 'On Fire',              description: 'Maintain a 7-day streak on any habit.',      icon: 'Fire',        category: 'habits',     xpReward: 100 },
  { id: 'streak_30',    title: 'Unstoppable',          description: 'Maintain a 30-day streak on any habit.',     icon: 'Flame',       category: 'habits',     xpReward: 300 },
  { id: 'streak_100',   title: 'Centurion',            description: 'Maintain a 100-day streak on any habit.',    icon: 'Crown',       category: 'habits',     xpReward: 750 },
  // Focus
  { id: 'first_tomato', title: 'First Tomato',         description: 'Complete your first Pomodoro session.',      icon: 'Timer',       category: 'focus',      xpReward: 50 },
  { id: 'tomato_10',    title: 'In the Zone',          description: 'Complete 10 Pomodoro sessions.',             icon: 'Hourglass',   category: 'focus',      xpReward: 100 },
  { id: 'tomato_50',    title: 'Focus Master',         description: 'Complete 50 Pomodoro sessions.',             icon: 'Brain',       category: 'focus',      xpReward: 200 },
  { id: 'tomato_100',   title: 'Deep Worker',          description: 'Complete 100 Pomodoro sessions.',            icon: 'Medal',       category: 'focus',      xpReward: 500 },
  // Tasks
  { id: 'first_task',   title: 'Task Initiated',       description: 'Complete your first task.',                  icon: 'CheckSquare', category: 'tasks',      xpReward: 50 },
  { id: 'task_25',      title: 'Productive',           description: 'Complete 25 tasks.',                         icon: 'ListChecks',  category: 'tasks',      xpReward: 150 },
  { id: 'task_100',     title: 'Execution King',       description: 'Complete 100 tasks.',                        icon: 'Trophy',      category: 'tasks',      xpReward: 350 },
  // Milestones
  { id: 'level_5',      title: 'Rising Star',          description: 'Reach Level 5.',                             icon: 'Star',        category: 'milestones', xpReward: 0 },
  { id: 'level_10',     title: 'Dedicated',            description: 'Reach Level 10.',                            icon: 'StarFour',    category: 'milestones', xpReward: 0 },
  { id: 'level_25',     title: 'Elite',                description: 'Reach Level 25.',                            icon: 'Diamond',     category: 'milestones', xpReward: 0 },
  { id: 'level_50',     title: 'Legend',               description: 'Reach Level 50.',                            icon: 'Rocket',      category: 'milestones', xpReward: 0 },
  // Special
  { id: 'early_bird',   title: 'Early Bird',           description: 'Complete a focus session before 7 AM.',     icon: 'Sun',         category: 'special',    xpReward: 75 },
  { id: 'night_owl',    title: 'Night Owl',            description: 'Complete a focus session after 10 PM.',     icon: 'Moon',        category: 'special',    xpReward: 75 },
];

export const ACHIEVEMENT_MAP: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a]),
);

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  habits: 'Habits',
  focus: 'Focus',
  tasks: 'Tasks',
  milestones: 'Milestones',
  special: 'Special',
};

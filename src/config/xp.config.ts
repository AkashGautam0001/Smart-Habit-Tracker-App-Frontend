export const XP_VALUES = {
  habitCompleted: 15,
  pomodoroCompleted: 25,
  taskCompleted: 20,
  journalEntry: 10,
  streakMilestone7: 50,
  streakMilestone30: 150,
  streakMilestone100: 500,
  goalMilestone: 30,
} as const;

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000,
  6500, 8200, 10200, 12500, 15000, 18000, 21500, 25500, 30000, 35000,
];

export const getLevelFromXP = (xp: number): number => {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
};

export const getXPForNextLevel = (level: number): number => {
  return LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
};

export const getLevelProgress = (xp: number, level: number): number => {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = getXPForNextLevel(level);
  if (nextThreshold === currentThreshold) return 100;
  return Math.round(((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
};

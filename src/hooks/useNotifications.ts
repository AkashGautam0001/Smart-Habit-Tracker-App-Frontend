export const useNotifications = () => {
  const isSupported = 'Notification' in window;

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    if (Notification.permission === 'granted') return true;
    const result = await Notification.requestPermission();
    return result === 'granted';
  };

  const notify = (title: string, options?: NotificationOptions) => {
    if (!isSupported || Notification.permission !== 'granted') return;
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options,
    });
  };

  const notifyBreakStart = (breakName: string, minutes: number) => {
    notify(`Time for a ${breakName}! 🎉`, {
      body: `Take a ${minutes}-minute break. You earned it.`,
      tag: 'pomodoro-break',
    });
  };

  const notifyFocusStart = () => {
    notify('Break over — time to focus! 🍅', {
      body: "Let's get back to work.",
      tag: 'pomodoro-focus',
    });
  };

  return { isSupported, requestPermission, notify, notifyBreakStart, notifyFocusStart };
};

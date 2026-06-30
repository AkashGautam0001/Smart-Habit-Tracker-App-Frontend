export interface AmbientSound {
  id: string;
  label: string;
  emoji: string;
  src: string;
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'lofi',       label: 'Lo-fi Beats',  emoji: '🎵', src: '/sounds/lofi.mp3' },
  { id: 'rain',       label: 'Rain',         emoji: '🌧️', src: '/sounds/rain.mp3' },
  { id: 'forest',     label: 'Forest',       emoji: '🌲', src: '/sounds/forest.mp3' },
  { id: 'whitenoise', label: 'White Noise',  emoji: '🔊', src: '/sounds/whitenoise.mp3' },
  { id: 'cafe',       label: 'Café',         emoji: '☕', src: '/sounds/cafe.mp3' },
];

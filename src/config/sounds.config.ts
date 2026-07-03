export interface AmbientSound {
  id: string;
  label: string;
  icon: string;
  src: string;
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'lofi',       label: 'Lo-fi',   icon: 'HeadphonesIcon',  src: '/sounds/lofi.mp3' },
  { id: 'rain',       label: 'Rain',    icon: 'CloudRainIcon',   src: '/sounds/rain.mp3' },
  { id: 'forest',     label: 'Forest',  icon: 'LeafIcon',        src: '/sounds/forest.mp3' },
  { id: 'whitenoise', label: 'White',   icon: 'WaveformIcon',    src: '/sounds/whitenoise.mp3' },
  { id: 'cafe',       label: 'Café',    icon: 'CoffeeIcon',      src: '/sounds/cafe.mp3' },
];

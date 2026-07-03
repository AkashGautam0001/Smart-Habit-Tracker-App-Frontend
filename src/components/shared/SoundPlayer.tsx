import { useState, useRef, useEffect } from 'react';
import type { ElementType } from 'react';
import { motion } from 'framer-motion';
import * as Icons from '@phosphor-icons/react';
import { SpeakerHighIcon, SpeakerSlashIcon, LockIcon, PlayIcon, StopIcon } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { AMBIENT_SOUNDS } from '../../config/sounds.config';
import { usePlan } from '../../hooks/usePlan';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function SoundPlayer() {
  const { isPro } = usePlan();
  const navigate = useNavigate();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(60);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const play = (soundId: string) => {
    const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId);
    if (!sound) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(sound.src);
    audio.loop = true;
    audio.volume = volume / 100;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPlaying(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const handleTile = (id: string) => {
    if (activeId === id) {
      if (playing) pause();
      else play(id);
    } else {
      setActiveId(id);
      play(id);
    }
  };

  const handleVolume = (v: number) => {
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v / 100;
    if (v > 0 && !playing && activeId) play(activeId);
  };

  if (!isPro) {
    return (
      <Card>
        <CardHeader className="flex-row items-center gap-2 space-y-0 px-4 py-3.5 pb-2">
          <SpeakerHighIcon size={16} weight="duotone" className="text-muted-foreground" />
          <CardTitle className="text-sm">Focus Music</CardTitle>
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
            <LockIcon size={10} weight="fill" className="mr-1" />
            PRO
          </Badge>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="mb-3 text-xs text-muted-foreground">
            Lo-fi beats, rain, forest, white noise & café sounds to keep you in flow.
          </p>
          <Button variant="outline" className="w-full" size="sm" onClick={() => navigate('/upgrade')}>
            Upgrade to Pro
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center gap-2 space-y-0 px-4 py-3.5 pb-2">
        {playing && activeId ? (
          <SpeakerHighIcon size={15} weight="fill" className="text-primary" />
        ) : (
          <SpeakerSlashIcon size={15} weight="duotone" className="text-muted-foreground" />
        )}
        <CardTitle className="text-sm">Focus Music</CardTitle>
        {playing && activeId && (
          <span className="ml-auto text-xs text-muted-foreground">
            {AMBIENT_SOUNDS.find((s) => s.id === activeId)?.label}
          </span>
        )}
      </CardHeader>

      <CardContent className="px-4 pb-4">
        <div className="mb-3 grid grid-cols-5 gap-1.5">
          {AMBIENT_SOUNDS.map((sound) => {
            const isActive = activeId === sound.id;
            const isPlaying = isActive && playing;
            return (
              <motion.button
                key={sound.id}
                whileTap={{ scale: 0.92 }}
                onClick={() => handleTile(sound.id)}
                title={sound.label}
                className={cn(
                  'flex min-h-0 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg border px-1 py-2 transition-colors',
                  isActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-secondary hover:bg-accent',
                )}
              >
                {(() => {
                  const SoundIcon = (Icons as unknown as Record<string, ElementType>)[sound.icon];
                  return SoundIcon ? (
                    <SoundIcon
                      size={18}
                      weight={isActive ? 'fill' : 'duotone'}
                      className={isActive ? 'text-primary' : 'text-muted-foreground'}
                    />
                  ) : null;
                })()}
                <span
                  className={cn(
                    'flex w-full items-center justify-center gap-0.5 truncate text-center text-[0.6rem]',
                    isActive ? 'font-semibold text-primary' : 'text-muted-foreground',
                  )}
                >
                  {isPlaying && <PlayIcon size={7} weight="fill" />}
                  {sound.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleVolume(volume === 0 ? 60 : 0)}
            aria-label={volume === 0 ? 'Unmute' : 'Mute'}
          >
            {volume === 0 ? (
              <SpeakerSlashIcon size={14} weight="bold" />
            ) : (
              <SpeakerHighIcon size={14} weight="bold" />
            )}
          </Button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => handleVolume(Number(e.target.value))}
            className="h-1.5 flex-1 cursor-pointer accent-primary"
            aria-label="Volume"
          />
          <span className="min-w-6.5 text-right text-xs tabular-nums text-muted-foreground">
            {volume}%
          </span>
        </div>

        {activeId && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-auto gap-1 p-0 text-xs text-muted-foreground"
            onClick={() => { pause(); setActiveId(null); }}
          >
            <StopIcon size={10} weight="fill" />
            Stop
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

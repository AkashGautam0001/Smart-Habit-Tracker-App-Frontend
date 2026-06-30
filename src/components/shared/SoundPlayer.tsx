import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SpeakerHighIcon, SpeakerSlashIcon, LockIcon } from '@phosphor-icons/react';
import { AMBIENT_SOUNDS } from '../../config/sounds.config';
import { usePlan } from '../../hooks/usePlan';
import { useNavigate } from 'react-router-dom';

export default function SoundPlayer() {
  const { isPro } = usePlan();
  const navigate  = useNavigate();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [playing,  setPlaying]  = useState(false);
  const [volume,   setVolume]   = useState(60);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Apply volume whenever it changes
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  // Cleanup on unmount
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
    audio.play().catch(() => { /* file may not exist in dev */ });
    audioRef.current = audio;
    setPlaying(true);
  };

  const pause = () => {
    audioRef.current?.pause();
    setPlaying(false);
  };

  const handleTile = (id: string) => {
    if (activeId === id) {
      if (playing) { pause(); } else { play(id); }
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
      <div className="card" style={{ padding: '14px 16px' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: 10, marginBottom: 10 }}>
          <SpeakerHighIcon size={16} weight="duotone" color="var(--color-text-muted)" />
          <span style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 600 }}>Focus Music</span>
          <span style={{
            alignItems: 'center', background: 'rgba(251,191,36,0.15)', borderRadius: 4,
            color: '#fbbf24', display: 'inline-flex', fontSize: '0.65rem', fontWeight: 700,
            gap: 3, padding: '2px 6px',
          }}>
            <LockIcon size={10} weight="fill" /> PRO
          </span>
        </div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', marginBottom: 10 }}>
          Lo-fi beats, rain, forest, white noise & café sounds to keep you in flow.
        </p>
        <button onClick={() => navigate('/upgrade')}
          style={{
            background: 'var(--color-surface-hover)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)',
            cursor: 'pointer', fontSize: '0.78rem', padding: '6px 14px', width: '100%',
          }}>
          Upgrade to Pro
        </button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ alignItems: 'center', display: 'flex', gap: 8, marginBottom: 12 }}>
        {playing && activeId
          ? <SpeakerHighIcon size={15} weight="fill" color="var(--color-accent)" />
          : <SpeakerSlashIcon size={15} weight="duotone" color="var(--color-text-muted)" />}
        <span style={{ color: 'var(--color-text)', fontSize: '0.875rem', fontWeight: 600 }}>
          Focus Music
        </span>
        {playing && activeId && (
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.72rem', marginLeft: 'auto' }}>
            {AMBIENT_SOUNDS.find((s) => s.id === activeId)?.label}
          </span>
        )}
      </div>

      {/* Sound tiles */}
      <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 12 }}>
        {AMBIENT_SOUNDS.map((sound) => {
          const isActive = activeId === sound.id;
          const isPlaying = isActive && playing;
          return (
            <motion.button
              key={sound.id}
              whileTap={{ scale: 0.92 }}
              onClick={() => handleTile(sound.id)}
              title={sound.label}
              style={{
                alignItems: 'center', border: `1.5px solid ${isActive ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3,
                justifyContent: 'center', minHeight: 'auto', minWidth: 'auto',
                padding: '8px 4px',
                background: isActive
                  ? 'color-mix(in srgb, var(--color-accent) 12%, var(--color-surface))'
                  : 'var(--color-surface-hover)',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>{sound.emoji}</span>
              <span style={{
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontSize: '0.6rem', fontWeight: isActive ? 600 : 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center',
              }}>
                {isPlaying ? '▶' : ''}{sound.label.split(' ')[0]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Volume slider */}
      <div style={{ alignItems: 'center', display: 'flex', gap: 8 }}>
        <button
          onClick={() => handleVolume(volume === 0 ? 60 : 0)}
          style={{
            background: 'none', border: 'none', color: 'var(--color-text-muted)',
            cursor: 'pointer', display: 'flex', flexShrink: 0,
            minHeight: 'auto', minWidth: 'auto', padding: 2,
          }}
        >
          {volume === 0
            ? <SpeakerSlashIcon size={14} weight="bold" />
            : <SpeakerHighIcon size={14} weight="bold" />
          }
        </button>
        <input
          type="range" min={0} max={100} value={volume}
          onChange={(e) => handleVolume(Number(e.target.value))}
          style={{ accentColor: 'var(--color-accent)', flex: 1 }}
          aria-label="Volume"
        />
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.7rem', minWidth: 26, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
          {volume}%
        </span>
      </div>

      {/* Stop button */}
      {activeId && (
        <button
          onClick={() => { pause(); setActiveId(null); }}
          style={{
            background: 'none', border: 'none', color: 'var(--color-text-muted)',
            cursor: 'pointer', fontSize: '0.72rem', marginTop: 8, padding: 0, textAlign: 'left',
          }}
        >
          ■ Stop
        </button>
      )}
    </div>
  );
}

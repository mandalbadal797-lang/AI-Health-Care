import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Headphones, FileText } from 'lucide-react';
import { Card } from '../cards/Card';
import { IconButton } from '../buttons/IconButton';

export interface PodcastPlayerPreviewProps {
  title: string;
  episodeNumber: number;
  durationSeconds: number;
}

export const PodcastPlayerPreview: React.FC<PodcastPlayerPreviewProps> = ({
  title,
  episodeNumber,
  durationSeconds,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentSeconds = (durationSeconds * progress) / 100;

  return (
    <Card glass className="p-md flex flex-col gap-sm" style={{ border: '1px solid var(--color-primary)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Headphones size={22} className="text-primary" />
          </div>
          <div>
            <span className="caption text-muted">Episode {episodeNumber} Audio Player</span>
            <h4 style={{ fontSize: '1rem' }}>{title}</h4>
          </div>
        </div>

        <IconButton icon={<FileText size={18} />} aria-label="Toggle full episode transcript" />
      </div>

      {/* Track Scrubber & Time */}
      <div className="flex items-center gap-md mt-2">
        <span className="caption text-muted text-mono">{formatTime(currentSeconds)}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          aria-label="Podcast playback progress"
        />
        <span className="caption text-muted text-mono">{formatTime(durationSeconds)}</span>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-center gap-md">
        <IconButton icon={<SkipBack size={18} />} aria-label="Skip back 10 seconds" size="sm" />
        <button
          className="btn btn-primary btn-icon"
          onClick={() => setIsPlaying(!isPlaying)}
          aria-label={isPlaying ? 'Pause podcast' : 'Play podcast'}
          style={{ width: '40px', height: '40px', borderRadius: '50%' }}
        >
          {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" style={{ marginLeft: '2px' }} />}
        </button>
        <IconButton icon={<SkipForward size={18} />} aria-label="Skip forward 10 seconds" size="sm" />
        <Volume2 size={18} className="text-muted" style={{ marginLeft: 'auto' }} />
      </div>
    </Card>
  );
};

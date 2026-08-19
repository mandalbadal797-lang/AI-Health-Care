import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Headphones, X, Loader2 } from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { IconButton } from '../buttons/IconButton';

export const GlobalPodcastPlayer: React.FC = () => {
  const {
    currentEpisode,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLoadingAudio,
    audioError,
    togglePlay,
    seek,
    changeVolume,
    toggleMute,
    closePlayer,
  } = useAudioPlayer();

  if (!currentEpisode) return null;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div
      className="card card-glass flex flex-col gap-xs p-md animate-slide-down"
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '900px',
        zIndex: 1000,
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--color-primary)',
      }}
      role="region"
      aria-label="Audio Player Controls"
    >
      <div className="flex items-center justify-between gap-md">
        {/* Episode Info */}
        <div className="flex items-center gap-md" style={{ overflow: 'hidden' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Headphones size={20} className="text-primary" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <span className="caption text-primary font-semibold">
              Ep {currentEpisode.episode_number} • {currentEpisode.category_name}
            </span>
            <h4
              style={{
                fontSize: '0.9375rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {currentEpisode.title}
            </h4>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-sm flex-shrink-0">
          <IconButton
            icon={<SkipBack size={18} />}
            aria-label="Skip back 10 seconds"
            size="sm"
            onClick={() => seek(Math.max(0, currentTime - 10))}
          />

          <button
            className="btn btn-primary btn-icon"
            onClick={togglePlay}
            disabled={isLoadingAudio}
            aria-label={isPlaying ? 'Pause podcast episode' : 'Play podcast episode'}
            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
          >
            {isLoadingAudio ? (
              <Loader2 size={18} className="animate-spin" />
            ) : isPlaying ? (
              <Pause size={20} fill="white" />
            ) : (
              <Play size={20} fill="white" style={{ marginLeft: '2px' }} />
            )}
          </button>

          <IconButton
            icon={<SkipForward size={18} />}
            aria-label="Skip forward 10 seconds"
            size="sm"
            onClick={() => seek(Math.min(duration, currentTime + 10))}
          />

          <div className="hidden md:flex items-center gap-xs ml-2">
            <IconButton
              icon={isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              aria-label={isMuted ? 'Unmute volume' : 'Mute volume'}
              size="sm"
              onClick={toggleMute}
            />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => changeVolume(parseFloat(e.target.value))}
              style={{ width: '70px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              aria-label="Volume level"
            />
          </div>

          <IconButton icon={<X size={18} />} aria-label="Close audio player" size="sm" onClick={closePlayer} />
        </div>
      </div>

      {/* Track Scrubber & Time Display */}
      <div className="flex items-center gap-sm text-small">
        <span className="caption text-muted text-mono">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          aria-label="Track progress seek slider"
        />
        <span className="caption text-muted text-mono">{formatTime(duration)}</span>
      </div>

      {audioError && (
        <span className="caption text-danger" role="alert" style={{ textAlign: 'center' }}>
          {audioError}
        </span>
      )}
    </div>
  );
};

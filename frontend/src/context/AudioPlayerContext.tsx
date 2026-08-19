import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { PodcastSummary, PodcastDetail } from '../types/domain';

export type PlayablePodcast = PodcastSummary | (PodcastDetail & { category_name?: string });

export interface AudioPlayerContextType {
  currentEpisode: PodcastSummary | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoadingAudio: boolean;
  audioError: string | null;
  playEpisode: (episode: PlayablePodcast) => void;
  togglePlay: () => void;
  seek: (seconds: number) => void;
  changeVolume: (vol: number) => void;
  toggleMute: () => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentEpisode, setCurrentEpisode] = useState<PodcastSummary | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const audio = new Audio();
    audio.preload = 'metadata';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || currentEpisode?.duration_seconds || 0);
      setIsLoadingAudio(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsLoadingAudio(false);
      setIsPlaying(false);
      setAudioError('Unable to play this audio episode right now.');
    };

    const handleWaiting = () => {
      setIsLoadingAudio(true);
    };

    const handleCanPlay = () => {
      setIsLoadingAudio(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      try {
        if (typeof audio.pause === 'function') {
          audio.pause();
        }
      } catch (e) {
        // Safe handling for test runners (e.g. JSDOM)
      }
    };
  }, []);

  const playEpisode = useCallback((episode: PlayablePodcast) => {
    const audio = audioRef.current;
    if (!audio) return;

    const summary: PodcastSummary = {
      id: episode.id,
      title: episode.title,
      slug: episode.slug,
      description: episode.description,
      audio_url: episode.audio_url,
      thumbnail_url: episode.thumbnail_url,
      duration_seconds: episode.duration_seconds,
      duration_formatted: episode.duration_formatted,
      episode_number: episode.episode_number,
      category_id: (episode as PodcastSummary).category_id || (episode as PodcastDetail).category?.id || 1,
      category_name: (episode as PodcastSummary).category_name || (episode as PodcastDetail).category?.name || 'General',
      category_slug: (episode as PodcastSummary).category_slug || (episode as PodcastDetail).category?.slug || 'general',
      publication_status: episode.publication_status,
      created_at: episode.created_at,
    };

    if (currentEpisode?.id === summary.id) {
      if (isPlaying) {
        try { audio.pause(); } catch(e){}
        setIsPlaying(false);
      } else {
        try {
          audio.play().then(() => setIsPlaying(true)).catch(() => setAudioError('Playback blocked by browser settings.'));
        } catch (e) {
          setAudioError('Playback blocked by browser settings.');
        }
      }
      return;
    }

    setCurrentEpisode(summary);
    setAudioError(null);
    setIsLoadingAudio(true);
    setCurrentTime(0);
    setDuration(summary.duration_seconds || 0);

    audio.src = summary.audio_url;
    audio.currentTime = 0;
    audio.volume = isMuted ? 0 : volume;

    try {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Playback play request error:', err);
          setIsPlaying(false);
          setIsLoadingAudio(false);
        });
    } catch (e) {
      setIsPlaying(false);
      setIsLoadingAudio(false);
    }
  }, [currentEpisode, isPlaying, volume, isMuted]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    if (isPlaying) {
      try { audio.pause(); } catch(e){}
      setIsPlaying(false);
    } else {
      try {
        audio.play().then(() => setIsPlaying(true)).catch(() => setAudioError('Unable to play audio.'));
      } catch(e) {
        setAudioError('Unable to play audio.');
      }
    }
  }, [currentEpisode, isPlaying]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    try { audio.currentTime = seconds; } catch(e){}
    setCurrentTime(seconds);
  }, []);

  const changeVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(1, vol));
    setVolume(clamped);
    try { audio.volume = isMuted ? 0 : clamped; } catch(e){}
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    try { audio.volume = nextMuted ? 0 : volume; } catch(e){}
  }, [isMuted, volume]);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      try { audio.pause(); } catch(e){}
    }
    setIsPlaying(false);
    setCurrentEpisode(null);
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentEpisode,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isLoadingAudio,
        audioError,
        playEpisode,
        togglePlay,
        seek,
        changeVolume,
        toggleMute,
        closePlayer,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};

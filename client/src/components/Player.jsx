import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Heart, 
  Maximize2, 
  ListMusic, 
  Mic2, 
  Activity, 
  Info,
  Gauge
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';

export default function Player() {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isShuffle,
    repeatMode,
    isFavorite,
    toggleFavorite,
    togglePlay,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    toggleMute,
    changePlaybackRate,
    toggleShuffle,
    toggleRepeat,
    rightPanelTab,
    setRightPanelTab,
    setIsFullscreen,
    queue
  } = useMusic();

  const [isHoveringScrubber, setIsHoveringScrubber] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);

  if (!currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isFavorite(currentSong.id);

  // Volume icon logic
  const VolumeIcon = isMuted || volume === 0 
    ? VolumeX 
    : volume < 0.5 
      ? Volume1 
      : Volume2;

  // Toggle side panel tab
  const handleTogglePanel = (tab) => {
    setRightPanelTab(prev => prev === tab ? null : tab);
  };

  // Speed options
  const speeds = [0.75, 1, 1.25, 1.5, 2];
  const nextSpeed = () => {
    const curIdx = speeds.indexOf(playbackRate);
    const nextIdx = (curIdx + 1) % speeds.length;
    changePlaybackRate(speeds[nextIdx]);
  };

  return (
    <footer className="h-20 bg-black border-t border-white/10 px-4 flex items-center justify-between text-white select-none z-40 relative">
      {/* 1. Left: Current Track Info & Like */}
      <div className="flex items-center gap-3 w-1/4 min-w-[180px] max-w-[300px]">
        <div className="relative group w-14 h-14 rounded overflow-hidden bg-zinc-800 shadow-lg flex-shrink-0">
          <img
            src={currentSong.coverUrl || '/covers/default.svg'}
            alt={currentSong.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/covers/default.svg';
            }}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h4 
            onClick={() => handleTogglePanel('nowplaying')}
            className="font-semibold text-sm text-white truncate hover:underline cursor-pointer"
            title={currentSong.title}
          >
            {currentSong.title}
          </h4>
          <p className="text-xs text-zinc-400 truncate hover:text-white hover:underline cursor-pointer">
            {currentSong.artist}
          </p>
        </div>

        <button
          onClick={() => toggleFavorite(currentSong.id)}
          className={`p-1.5 transition-transform hover:scale-110 ${
            liked ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
          }`}
          title={liked ? 'Liked' : 'Like'}
        >
          <Heart className={`w-5 h-5 ${liked ? 'fill-[#1db954]' : ''}`} />
        </button>
      </div>

      {/* 2. Center: Audio Controls & Scrubber */}
      <div className="flex flex-col items-center gap-1.5 w-2/4 max-w-2xl px-2">
        {/* Buttons */}
        <div className="flex items-center gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-1 text-sm transition-colors relative ${
              isShuffle ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
            }`}
            title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
          >
            <Shuffle className="w-4 h-4" />
            {isShuffle && (
              <span className="w-1 h-1 rounded-full bg-[#1db954] absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={playPrevious}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-md"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-black" />
            ) : (
              <Play className="w-5 h-5 fill-black ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`p-1 text-sm transition-colors relative ${
              repeatMode !== 'off' ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
            }`}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
            {repeatMode !== 'off' && (
              <span className="w-1 h-1 rounded-full bg-[#1db954] absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </button>
        </div>

        {/* Progress Bar / Scrubber */}
        <div className="w-full flex items-center gap-2 text-[11px] text-zinc-400 tabular-nums">
          <span className="w-9 text-right">{formatTime(currentTime)}</span>

          <div
            className="relative flex-1 group py-1.5 flex items-center cursor-pointer"
            onMouseEnter={() => setIsHoveringScrubber(true)}
            onMouseLeave={() => {
              setIsHoveringScrubber(false);
              setHoverTime(null);
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              setHoverTime(pos * duration);
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seekTo(pos * duration);
            }}
          >
            {/* Background Track */}
            <div className="w-full h-1 group-hover:h-1.5 rounded-full bg-zinc-700/60 overflow-hidden relative transition-all">
              {/* Green Played Bar */}
              <div
                className="h-full bg-white group-hover:bg-[#1db954] rounded-full transition-colors"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Scrubber Knob */}
            <div
              className="absolute w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2 pointer-events-none"
              style={{ left: `${progressPercent}%` }}
            />

            {/* Hover preview tooltip */}
            {isHoveringScrubber && hoverTime !== null && (
              <div
                className="absolute -top-7 -translate-x-1/2 bg-[#282828] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow pointer-events-none border border-white/10"
                style={{ left: `${(hoverTime / duration) * 100}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          <span className="w-9 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Right: Side Toggles, Speed, Volume & Fullscreen */}
      <div className="flex items-center justify-end gap-2.5 w-1/4 min-w-[200px]">
        {/* Real-time Visualizer Button */}
        <button
          onClick={() => handleTogglePanel('visualizer')}
          className={`p-1.5 rounded-full transition-colors relative ${
            rightPanelTab === 'visualizer' ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
          }`}
          title="Audio Spectrum Visualizer"
        >
          <Activity className="w-4 h-4" />
          {rightPanelTab === 'visualizer' && (
            <span className="w-1 h-1 rounded-full bg-[#1db954] absolute bottom-0 left-1/2 -translate-x-1/2" />
          )}
        </button>

        {/* Lyrics Button */}
        <button
          onClick={() => handleTogglePanel('lyrics')}
          className={`p-1.5 rounded-full transition-colors relative ${
            rightPanelTab === 'lyrics' ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
          }`}
          title="Lyrics"
        >
          <Mic2 className="w-4 h-4" />
          {rightPanelTab === 'lyrics' && (
            <span className="w-1 h-1 rounded-full bg-[#1db954] absolute bottom-0 left-1/2 -translate-x-1/2" />
          )}
        </button>

        {/* Queue Button */}
        <button
          onClick={() => handleTogglePanel('queue')}
          className={`p-1.5 rounded-full transition-colors relative ${
            rightPanelTab === 'queue' ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
          }`}
          title="Play Queue"
        >
          <ListMusic className="w-4 h-4" />
          {queue.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#1db954] text-black text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
              {queue.length}
            </span>
          )}
        </button>

        {/* Speed button */}
        <button
          onClick={nextSpeed}
          className="text-[11px] font-bold px-1.5 py-0.5 rounded text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Playback speed"
        >
          {playbackRate}x
        </button>

        {/* Volume Controls */}
        <div className="flex items-center gap-1.5 group">
          <button
            onClick={toggleMute}
            className="text-zinc-400 hover:text-white transition-colors p-1"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            <VolumeIcon className="w-4 h-4" />
          </button>

          <div className="w-20 relative flex items-center py-1">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="w-full h-1 group-hover:h-1.5 rounded-full bg-zinc-700/60 accent-[#1db954]"
            />
          </div>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(prev => !prev)}
          className="p-1.5 text-zinc-400 hover:text-white transition-colors"
          title="Fullscreen Mode"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </footer>
  );
}


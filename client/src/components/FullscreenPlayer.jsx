import React from 'react';
import { 
  Minimize2, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';

export default function FullscreenPlayer() {
  const {
    isFullscreen,
    setIsFullscreen,
    currentSong,
    isPlaying,
    currentTime,
    duration,
    seekTo,
    togglePlay,
    playNext,
    playPrevious,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    isFavorite,
    toggleFavorite,
    volume,
    setVolumeLevel,
    isMuted,
    toggleMute
  } = useMusic();

  if (!isFullscreen || !currentSong) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = isFavorite(currentSong.id);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-8 md:p-14 select-none overflow-hidden animate-in fade-in duration-300">
      {/* Blurred Album Art Background Glow */}
      <div 
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-25 scale-125 pointer-events-none transition-all duration-700"
        style={{ backgroundImage: `url(${currentSong.coverUrl})` }}
      />
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1db954] animate-ping" />
          <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold">
            Playing from Fedora Library • {currentSong.album || 'Single'}
          </span>
        </div>

        <button
          onClick={() => setIsFullscreen(false)}
          className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white hover:scale-105"
          title="Exit Fullscreen (Esc)"
        >
          <Minimize2 className="w-6 h-6" />
        </button>
      </div>

      {/* Center Artwork & Visual Presence */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-10 my-auto max-w-5xl mx-auto w-full">
        <div className="relative w-64 h-64 md:w-96 md:h-96 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 flex-shrink-0 group">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col gap-4 text-center md:text-left min-w-0 flex-1">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight truncate drop-shadow-md">
            {currentSong.title}
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 font-medium truncate">
            {currentSong.artist}
          </p>
          <p className="text-sm text-zinc-400">
            {currentSong.genre || 'Music'} • {currentSong.bitrate ? `${currentSong.bitrate} kbps` : '320 kbps'} • High Definition
          </p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col gap-4">
        {/* Scrubber */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 font-semibold tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <div 
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              seekTo(pos * duration);
            }}
            className="flex-1 h-2 bg-white/20 hover:h-2.5 rounded-full overflow-hidden cursor-pointer relative group transition-all"
          >
            <div 
              className="h-full bg-[#1db954] rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => toggleFavorite(currentSong.id)}
            className={`p-2 transition-transform hover:scale-110 ${
              liked ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className={`w-6 h-6 ${liked ? 'fill-[#1db954]' : ''}`} />
          </button>

          <div className="flex items-center gap-8">
            <button
              onClick={toggleShuffle}
              className={`p-2 transition-colors ${isShuffle ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'}`}
            >
              <Shuffle className="w-5 h-5" />
            </button>

            <button
              onClick={playPrevious}
              className="text-zinc-300 hover:text-white transition-colors"
            >
              <SkipBack className="w-7 h-7 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-2xl shadow-white/20"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 fill-black" />
              ) : (
                <Play className="w-8 h-8 fill-black ml-1" />
              )}
            </button>

            <button
              onClick={playNext}
              className="text-zinc-300 hover:text-white transition-colors"
            >
              <SkipForward className="w-7 h-7 fill-current" />
            </button>

            <button
              onClick={toggleRepeat}
              className={`p-2 transition-colors ${repeatMode !== 'off' ? 'text-[#1db954]' : 'text-zinc-400 hover:text-white'}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
              className="w-24 h-1.5 rounded-full bg-zinc-700 accent-[#1db954]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}


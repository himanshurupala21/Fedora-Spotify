import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  MoreHorizontal, 
  Plus, 
  ListPlus, 
  Download, 
  Music, 
  Check
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';

export default function SongRow({ song, index, songList = [] }) {
  const { 
    currentSong, 
    isPlaying, 
    playSong, 
    togglePlay, 
    isFavorite, 
    toggleFavorite,
    addToQueue,
    playlists,
    toggleSongInPlaylist
  } = useMusic();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showPlaylistSubmenu, setShowPlaylistSubmenu] = useState(false);
  const menuRef = useRef(null);

  const isCurrent = currentSong?.id === song.id;
  const isPlayingCurrent = isCurrent && isPlaying;
  const liked = isFavorite(song.id);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
        setShowPlaylistSubmenu(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleRowClick = () => {
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, songList);
    }
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = song.audioUrl;
    link.download = song.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsMenuOpen(false);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group relative flex items-center justify-between sm:grid sm:grid-cols-[20px_1fr_auto] md:grid-cols-[24px_6fr_4fr_2fr_minmax(100px,1fr)] gap-2 sm:gap-4 px-2 sm:px-4 py-2 sm:py-2.5 rounded-md hover:bg-white/10 active:bg-white/15 transition-colors text-sm text-zinc-400 select-none cursor-pointer ${
        isCurrent ? 'bg-white/5 text-white' : ''
      }`}
    >
      {/* 1. Track Index / Playing Indicator / Play Button (Tablet & Desktop) */}
      <div className="hidden sm:flex items-center justify-center w-6">
        {isPlayingCurrent ? (
          <div className="flex items-end gap-[2px] h-4 w-4">
            <span className="w-1 bg-[#1db954] animate-eq-1 rounded-full inline-block" />
            <span className="w-1 bg-[#1db954] animate-eq-2 rounded-full inline-block" />
            <span className="w-1 bg-[#1db954] animate-eq-3 rounded-full inline-block" />
            <span className="w-1 bg-[#1db954] animate-eq-4 rounded-full inline-block" />
          </div>
        ) : (
          <>
            <span className={`group-hover:hidden text-xs font-semibold ${isCurrent ? 'text-[#1db954]' : 'text-zinc-500'}`}>
              {index + 1}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRowClick();
              }}
              className="hidden group-hover:flex items-center justify-center text-white hover:scale-110 transition-transform"
            >
              <Play className="w-4 h-4 fill-white" />
            </button>
          </>
        )}
      </div>

      {/* 2. Song Cover, Title & Artist */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 pr-2">
        <div className="relative w-10 h-10 sm:w-10 sm:h-10 rounded bg-[#282828] overflow-hidden flex-shrink-0 shadow">
          <img
            src={song.coverUrl || '/covers/default.svg'}
            alt={song.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/covers/default.svg';
            }}
          />
          {isPlayingCurrent && (
            <div className="sm:hidden absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-[#1db954] animate-ping" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`font-semibold truncate text-xs sm:text-sm ${
              isCurrent ? 'text-[#1db954] font-bold' : 'text-white'
            }`}
          >
            {song.title}
          </p>
          <p className="text-[11px] sm:text-xs text-zinc-400 truncate">
            {song.artist}
          </p>
        </div>
      </div>

      {/* 3. Album Column (Desktop only) */}
      <div className="hidden md:block truncate text-xs text-zinc-400 hover:text-white transition-colors">
        {song.album || 'Single'}
      </div>

      {/* 4. Bitrate / Format (Desktop only) */}
      <div className="hidden md:flex items-center text-xs text-zinc-400">
        <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] uppercase font-mono tracking-wider">
          {song.bitrate ? `${song.bitrate} kbps` : 'MP3'}
        </span>
      </div>

      {/* 5. Like Heart, Duration & Options Menu */}
      <div className="flex items-center justify-end gap-1.5 sm:gap-3 text-xs flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        {/* Heart / Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(song.id);
          }}
          className={`p-1.5 transition-all ${
            liked 
              ? 'text-[#1db954] opacity-100' 
              : 'text-zinc-500 opacity-80 sm:opacity-0 group-hover:opacity-100 hover:text-white'
          }`}
          title={liked ? 'Remove from Your Library' : 'Save to Your Library'}
        >
          <Heart className={`w-4 h-4 ${liked ? 'fill-[#1db954]' : ''}`} />
        </button>

        {/* Duration (Tablet & Desktop) */}
        <span className="hidden sm:inline-block tabular-nums text-zinc-400 min-w-[36px] text-right">
          {formatTime(song.duration)}
        </span>

        {/* 3-Dots Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(prev => !prev);
            }}
            className="p-1.5 text-zinc-400 sm:text-zinc-500 hover:text-white opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/10"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Context Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-40 w-48 bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-1 text-xs text-zinc-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToQueue(song);
                  setIsMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ListPlus className="w-4 h-4" />
                <span>Add to Queue</span>
              </button>

              {/* Add to Playlist subtrigger */}
              <div 
                className="relative"
                onMouseEnter={() => setShowPlaylistSubmenu(true)}
                onMouseLeave={() => setShowPlaylistSubmenu(false)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowPlaylistSubmenu(prev => !prev);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-white/10 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Add to Playlist</span>
                  </span>
                  <span>▸</span>
                </button>

                {showPlaylistSubmenu && (
                  <div className="absolute right-full top-0 sm:left-full sm:right-auto w-44 bg-[#282828] border border-white/10 rounded-lg shadow-2xl py-1 z-50">
                    {playlists.length === 0 ? (
                      <div className="px-3 py-2 text-zinc-500 text-[11px]">No playlists yet</div>
                    ) : (
                      playlists.map(pl => {
                        const inPlaylist = pl.songs.includes(song.id);
                        return (
                          <button
                            key={pl.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSongInPlaylist(pl.id, song.id);
                              setIsMenuOpen(false);
                            }}
                            className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-white/10 hover:text-white transition-colors"
                          >
                            <span className="truncate">{pl.name}</span>
                            {inPlaylist && <Check className="w-3.5 h-3.5 text-[#1db954]" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleDownload}
                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-white/10 hover:text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Audio</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

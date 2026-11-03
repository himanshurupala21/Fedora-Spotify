import React from 'react';
import { Play, Pause } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function SongCard({ song, songList = [] }) {
  const { currentSong, isPlaying, playSong, togglePlay } = useMusic();

  const isCurrent = currentSong?.id === song.id;
  const isPlayingCurrent = isCurrent && isPlaying;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlay();
    } else {
      playSong(song, songList);
    }
  };

  return (
    <div
      onClick={() => playSong(song, songList)}
      className="group relative bg-[#181818] hover:bg-[#282828] p-3.5 rounded-lg cursor-pointer transition-all duration-300 flex flex-col gap-3 shadow-md hover:shadow-xl"
    >
      {/* Artwork Container */}
      <div className="relative aspect-square w-full rounded-md overflow-hidden bg-[#242424] shadow-md">
        <img
          src={song.coverUrl || '/covers/default.svg'}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/covers/default.svg';
          }}
        />
        {/* Play Button Overlay */}
        <button
          onClick={handlePlayClick}
          className={`absolute bottom-2 right-2 w-11 h-11 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-2xl transition-all duration-300 transform ${
            isPlayingCurrent
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-2 scale-90 group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 hover:scale-105 hover:bg-[#1ed760]'
          }`}
          title={isPlayingCurrent ? 'Pause' : 'Play'}
        >
          {isPlayingCurrent ? (
            <Pause className="w-5 h-5 fill-black" />
          ) : (
            <Play className="w-5 h-5 fill-black ml-0.5" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="min-w-0">
        <h4 className={`font-bold truncate text-sm mb-1 ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
          {song.title}
        </h4>
        <p className="text-xs text-zinc-400 truncate line-clamp-2">
          {song.artist}
        </p>
      </div>
    </div>
  );
}


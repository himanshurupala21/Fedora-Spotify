import React from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Clock, 
  Music, 
  Sparkles, 
  UploadCloud, 
  Flame, 
  Compass, 
  ListPlus,
  Trash2,
  FolderOpen
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { getGreeting, formatTime } from '../utils/formatters';
import SongRow from './SongRow';
import SongCard from './SongCard';

export default function MainView() {
  const {
    songs,
    loading,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    activeTab,
    selectedPlaylistId,
    playlists,
    favorites,
    isFavorite,
    toggleFavorite,
    searchQuery,
    setSearchQuery,
    getActiveSongList,
    setIsUploadModalOpen,
    deletePlaylist
  } = useMusic();

  const greeting = getGreeting();
  const displaySongs = getActiveSongList();

  // Selected playlist object
  const currentPlaylist = playlists.find(p => p.id === selectedPlaylistId);

  // Play entire current view starting from first song
  const handlePlayAll = () => {
    if (displaySongs.length > 0) {
      if (currentSong && displaySongs.some(s => s.id === currentSong.id)) {
        togglePlay();
      } else {
        playSong(displaySongs[0], displaySongs);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-400">
        <div className="w-10 h-10 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin" />
        <p className="font-semibold text-sm">Scanning Songs folder & ID3 tags...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 select-none">
      {/* ================= 1. HOME VIEW ================= */}
      {activeTab === 'home' && (
        <div className="space-y-8">
          {/* Greeting Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-4">
              {greeting}
            </h1>

            {/* Quick 6 Grid Cards (Spotify Home style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Liked songs quick card */}
              <div 
                onClick={handlePlayAll}
                className="group flex items-center bg-white/5 hover:bg-white/15 rounded-md overflow-hidden cursor-pointer transition-all duration-200 relative shadow"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-700 via-purple-600 to-emerald-400 flex items-center justify-center text-white flex-shrink-0 shadow">
                  <Heart className="w-7 h-7 fill-white" />
                </div>
                <div className="flex-1 px-3 min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">Liked Songs</h4>
                  <p className="text-xs text-zinc-400">{favorites.length} tracks</p>
                </div>
                <div className="mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  </button>
                </div>
              </div>

              {/* First 5 songs as quick cards */}
              {songs.slice(0, 5).map(song => {
                const isCurrent = currentSong?.id === song.id;
                return (
                  <div
                    key={`quick-${song.id}`}
                    onClick={() => playSong(song, songs)}
                    className="group flex items-center bg-white/5 hover:bg-white/15 rounded-md overflow-hidden cursor-pointer transition-all duration-200 relative shadow"
                  >
                    <div className="w-16 h-16 bg-zinc-800 flex-shrink-0 relative overflow-hidden">
                      <img 
                        src={song.coverUrl || '/covers/default.svg'} 
                        alt={song.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/covers/default.svg';
                        }}
                      />
                    </div>
                    <div className="flex-1 px-3 min-w-0">
                      <h4 className={`font-bold text-sm truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                        {song.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                    <div className="mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-5 h-5 fill-black" />
                        ) : (
                          <Play className="w-5 h-5 fill-black ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Featured Cards Row */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Flame className="w-5 h-5 text-[#1db954]" />
                Featured In Songs Folder
              </h2>
              <span className="text-xs text-zinc-400 font-medium">
                {songs.length} Tracks Available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {songs.slice(0, 6).map(song => (
                <SongCard key={`card-${song.id}`} song={song} songList={songs} />
              ))}
            </div>
          </div>

          {/* All Songs Table Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  All Library Tracks
                </h2>
                <p className="text-xs text-zinc-400">
                  {displaySongs.length} songs ready to stream directly from local storage
                </p>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 text-xs font-bold text-[#1db954] hover:text-white bg-[#1db954]/10 hover:bg-[#1db954]/20 border border-[#1db954]/30 px-3.5 py-1.5 rounded-full transition-all"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload More Songs</span>
              </button>
            </div>

            {/* Song Table Header */}
            <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] md:grid-cols-[24px_6fr_4fr_2fr_minmax(100px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <span className="text-center">#</span>
              <span>Title</span>
              <span className="hidden md:block">Album</span>
              <span className="hidden md:block">Format</span>
              <div className="flex items-center justify-end gap-3">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            {/* Song Rows */}
            <div className="space-y-0.5">
              {displaySongs.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  songList={displaySongs}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. SEARCH VIEW ================= */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-white">Search Library</h2>

          {searchQuery ? (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Search results for <span className="text-white font-bold">"{searchQuery}"</span> ({displaySongs.length} found)
              </p>

              {displaySongs.length === 0 ? (
                <div className="text-center py-16 bg-[#181818] rounded-xl border border-white/5 space-y-3">
                  <Music className="w-12 h-12 text-zinc-600 mx-auto" />
                  <h3 className="font-bold text-lg text-white">No songs found matching "{searchQuery}"</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Check your spelling, or try searching for another artist or movie. You can also upload downloaded songs!
                  </p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-2 bg-[#1db954] text-black font-bold text-xs px-5 py-2 rounded-full"
                  >
                    Upload this song
                  </button>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {displaySongs.map((song, idx) => (
                    <SongRow
                      key={song.id}
                      song={song}
                      index={idx}
                      songList={displaySongs}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white">Browse Categories & Moods</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[
                  { name: 'Bollywood Hits', color: 'from-orange-600 to-amber-700', query: 'arijit' },
                  { name: 'Devotional & Bhajans', color: 'from-amber-600 to-yellow-800', query: 'shambhu' },
                  { name: 'Punjabi Bangers', color: 'from-emerald-600 to-teal-800', query: 'munde' },
                  { name: 'Gujarati Folk & Garba', color: 'from-rose-600 to-pink-800', query: 'radha' },
                  { name: 'Romantic Vibes', color: 'from-purple-600 to-indigo-800', query: 'chahun' },
                  { name: 'Remixes & Beats', color: 'from-blue-600 to-cyan-800', query: 'remix' },
                  { name: 'Shiv Mahadev', color: 'from-sky-700 to-blue-900', query: 'shiv' },
                  { name: 'Trending Tracks', color: 'from-fuchsia-600 to-rose-700', query: 'love' },
                ].map(genre => (
                  <div
                    key={genre.name}
                    onClick={() => setSearchQuery(genre.query)}
                    className={`bg-gradient-to-br ${genre.color} h-36 rounded-xl p-4 cursor-pointer relative overflow-hidden shadow-lg hover:scale-[1.02] transition-transform`}
                  >
                    <h4 className="font-bold text-lg text-white">{genre.name}</h4>
                    <Compass className="w-16 h-16 absolute -bottom-3 -right-3 text-white/20 rotate-12" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. LIKED SONGS VIEW ================= */}
      {activeTab === 'liked' && (
        <div className="space-y-6">
          {/* Spotify Liked Songs Banner */}
          <div className="flex flex-col sm:flex-row items-end gap-6 bg-gradient-to-b from-indigo-800 to-[#121212] -mx-6 -mt-4 p-8 rounded-b-2xl border-b border-white/5">
            <div className="w-48 h-48 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-400 flex items-center justify-center text-white shadow-2xl flex-shrink-0">
              <Heart className="w-20 h-20 fill-white drop-shadow-lg" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-zinc-300">
                Playlist
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                Liked Songs
              </h1>
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                <span className="font-bold text-white">Fedora User</span>
                <span>•</span>
                <span>{displaySongs.length} songs</span>
              </div>
            </div>
          </div>

          {/* Play Button & Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayAll}
              disabled={displaySongs.length === 0}
              className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all"
              title="Play all liked songs"
            >
              <Play className="w-7 h-7 fill-black ml-1" />
            </button>
          </div>

          {/* Tracks list */}
          {displaySongs.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 space-y-2">
              <Heart className="w-12 h-12 mx-auto stroke-zinc-600" />
              <h3 className="font-bold text-white text-base">Songs you like will appear here</h3>
              <p className="text-xs text-zinc-400">Save songs by tapping the heart icon on any track.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {displaySongs.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  songList={displaySongs}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 4. CUSTOM PLAYLIST VIEW ================= */}
      {activeTab === 'playlist' && currentPlaylist && (
        <div className="space-y-6">
          {/* Playlist Banner */}
          <div className="flex flex-col sm:flex-row items-end gap-6 bg-gradient-to-b from-emerald-900 to-[#121212] -mx-6 -mt-4 p-8 rounded-b-2xl border-b border-white/5">
            <div className="w-48 h-48 rounded-xl bg-[#282828] flex items-center justify-center text-zinc-400 shadow-2xl flex-shrink-0">
              <Music className="w-20 h-20 text-[#1db954]" />
            </div>

            <div className="space-y-2 flex-1">
              <span className="text-xs uppercase font-bold tracking-widest text-zinc-300">
                Public Playlist
              </span>
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
                {currentPlaylist.name}
              </h1>
              <p className="text-xs text-zinc-300">{currentPlaylist.description}</p>
              <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                <span className="font-bold text-white">Fedora Tunes</span>
                <span>•</span>
                <span>{displaySongs.length} songs</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayAll}
                disabled={displaySongs.length === 0}
                className="w-14 h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black flex items-center justify-center shadow-xl hover:scale-105 transition-all"
                title="Play Playlist"
              >
                <Play className="w-7 h-7 fill-black ml-1" />
              </button>
            </div>

            {currentPlaylist.id !== 'default-favorites' && (
              <button
                onClick={() => {
                  if (confirm(`Delete playlist "${currentPlaylist.name}"?`)) {
                    deletePlaylist(currentPlaylist.id);
                  }
                }}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Playlist</span>
              </button>
            )}
          </div>

          {/* Song list */}
          {displaySongs.length === 0 ? (
            <div className="text-center py-16 text-zinc-500 space-y-3">
              <ListPlus className="w-12 h-12 mx-auto stroke-zinc-600" />
              <h3 className="font-bold text-white text-base">This playlist is currently empty</h3>
              <p className="text-xs text-zinc-400">
                Add tracks from the home screen using the 3-dots menu on any song!
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {displaySongs.map((song, idx) => (
                <SongRow
                  key={song.id}
                  song={song}
                  index={idx}
                  songList={displaySongs}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= 5. GENERAL LIBRARY VIEW ================= */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-white">Your Entire Collection</h1>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 bg-[#1db954] text-black font-bold text-xs px-4 py-2 rounded-full shadow hover:scale-105 transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Song</span>
            </button>
          </div>

          <div className="space-y-0.5">
            {songs.map((song, idx) => (
              <SongRow
                key={`lib-${song.id}`}
                song={song}
                index={idx}
                songList={songs}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


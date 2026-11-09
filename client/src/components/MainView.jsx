import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Heart, 
  Clock, 
  Music, 
  UploadCloud, 
  Flame, 
  Compass, 
  ListPlus,
  Trash2,
  ChevronLeft,
  Plus,
  ListMusic,
  FolderHeart,
  Sparkles
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
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
    setActiveTab,
    selectedPlaylistId,
    setSelectedPlaylistId,
    playlists,
    favorites,
    isFavorite,
    searchQuery,
    setSearchQuery,
    getActiveSongList,
    setIsUploadModalOpen,
    setIsCreatePlaylistOpen,
    deletePlaylist
  } = useMusic();

  const { currentUser } = useAuth();
  const [libraryFilter, setLibraryFilter] = useState('all'); // 'all' | 'playlists' | 'liked' | 'tracks'

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
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-zinc-400 p-4">
        <div className="w-10 h-10 border-4 border-[#1db954] border-t-transparent rounded-full animate-spin" />
        <p className="font-semibold text-xs sm:text-sm">Scanning Songs folder & ID3 tags...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4 pb-36 md:pb-8 space-y-6 sm:space-y-8 select-none">
      {/* ================= 1. HOME VIEW ================= */}
      {activeTab === 'home' && (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
          {/* Greeting Header */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight mb-3 sm:mb-4">
              {greeting}
            </h1>

            {/* Quick 6 Grid Cards (Spotify Home style) */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {/* Liked songs quick card */}
              <div 
                onClick={() => {
                  setActiveTab('liked');
                  setSelectedPlaylistId(null);
                }}
                className="group flex items-center bg-white/5 hover:bg-white/15 active:bg-white/20 rounded-md overflow-hidden cursor-pointer transition-all duration-200 relative shadow"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-700 via-purple-600 to-emerald-400 flex items-center justify-center text-white flex-shrink-0 shadow">
                  <Heart className="w-5 h-5 sm:w-7 sm:h-7 fill-white" />
                </div>
                <div className="flex-1 px-2.5 sm:px-3 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate">Liked Songs</h4>
                  <p className="text-[10px] sm:text-xs text-zinc-400">{favorites.length} tracks</p>
                </div>
                <div className="hidden sm:block mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />
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
                    className="group flex items-center bg-white/5 hover:bg-white/15 active:bg-white/20 rounded-md overflow-hidden cursor-pointer transition-all duration-200 relative shadow"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-zinc-800 flex-shrink-0 relative overflow-hidden">
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
                    <div className="flex-1 px-2.5 sm:px-3 min-w-0">
                      <h4 className={`font-bold text-xs sm:text-sm truncate ${isCurrent ? 'text-[#1db954]' : 'text-white'}`}>
                        {song.title}
                      </h4>
                      <p className="text-[10px] sm:text-xs text-zinc-400 truncate">{song.artist}</p>
                    </div>
                    <div className="hidden sm:block mr-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#1db954] text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                        {isCurrent && isPlaying ? (
                          <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-black" />
                        ) : (
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-black ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 1: Fresh & Trending Grid */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                  Featured Tracks
                </h2>
              </div>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                High Fidelity Stream
              </span>
            </div>

            {/* Grid of Song Cards */}
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4">
              {songs.slice(0, 12).map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  songList={songs}
                />
              ))}
            </div>
          </div>

          {/* Section 2: All Songs Table */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  All Library Tracks
                </h2>
                <p className="text-xs text-zinc-400">
                  {displaySongs.length} songs ready to stream
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayAll}
                  className="flex items-center gap-1.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow hover:scale-105 active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
                  <span>Play All</span>
                </button>
              </div>
            </div>

            {/* Song Table Header (Desktop only) */}
            <div className="hidden md:grid md:grid-cols-[24px_6fr_4fr_2fr_minmax(100px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <span>#</span>
              <span>Title</span>
              <span>Album</span>
              <span>Genre</span>
              <span className="flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" />
              </span>
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
        <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
          <h2 className="text-xl sm:text-2xl font-black text-white">Search Library</h2>

          {searchQuery ? (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-zinc-400">
                Search results for <span className="text-white font-bold">"{searchQuery}"</span> ({displaySongs.length} found)
              </p>

              {displaySongs.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-[#181818] rounded-xl border border-white/5 space-y-3 p-4">
                  <Music className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-600 mx-auto" />
                  <h3 className="font-bold text-base sm:text-lg text-white">No songs found matching "{searchQuery}"</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Try searching for another artist or movie title, or upload your downloaded songs!
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
              <h3 className="font-bold text-base sm:text-lg text-white">Browse Categories & Moods</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-4">
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
                    className={`bg-gradient-to-br ${genre.color} h-28 sm:h-36 rounded-xl p-3 sm:p-4 cursor-pointer relative overflow-hidden shadow-lg hover:scale-[1.02] active:scale-95 transition-transform`}
                  >
                    <h4 className="font-bold text-sm sm:text-base text-white">{genre.name}</h4>
                    <Compass className="w-12 h-12 sm:w-16 sm:h-16 absolute -bottom-2 -right-2 text-white/20 rotate-12" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 3. LIKED SONGS VIEW ================= */}
      {activeTab === 'liked' && (
        <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
          {/* Back button */}
          <div>
            <button
              onClick={() => {
                setActiveTab('library');
                setSelectedPlaylistId(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/10 hover:bg-white/15 active:bg-white/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer backdrop-blur-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </button>
          </div>

          {/* Spotify Liked Songs Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4 sm:gap-6 bg-gradient-to-b from-indigo-800 to-[#121212] -mx-3 sm:-mx-6 -mt-3 sm:-mt-4 p-5 sm:p-8 rounded-b-xl sm:rounded-b-2xl border-b border-white/5 shadow-xl">
            <div className="w-28 h-28 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-400 flex items-center justify-center text-white shadow-2xl flex-shrink-0">
              <Heart className="w-14 h-14 sm:w-20 sm:h-20 fill-white drop-shadow-lg" />
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-zinc-300">
                Playlist
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tight">
                Liked Songs
              </h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-zinc-300 font-medium">
                <span className="font-bold text-white">{currentUser?.name || 'Authorized Member'}</span>
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
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
              title="Play all liked songs"
            >
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black ml-0.5 sm:ml-1" />
            </button>
          </div>

          {/* Tracks list */}
          {displaySongs.length === 0 ? (
            <div className="text-center py-12 sm:py-16 text-zinc-500 space-y-2 p-4">
              <Heart className="w-10 h-10 sm:w-12 sm:h-12 mx-auto stroke-zinc-600" />
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
        <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-200">
          {/* Back button */}
          <div>
            <button
              onClick={() => {
                setActiveTab('library');
                setSelectedPlaylistId(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-white/10 hover:bg-white/15 active:bg-white/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer backdrop-blur-md"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Library</span>
            </button>
          </div>

          {/* Playlist Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end text-center sm:text-left gap-4 sm:gap-6 bg-gradient-to-b from-emerald-900 to-[#121212] -mx-3 sm:-mx-6 -mt-3 sm:-mt-4 p-5 sm:p-8 rounded-b-xl sm:rounded-b-2xl border-b border-white/5 shadow-xl">
            <div className="w-28 h-28 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-xl bg-[#282828] flex items-center justify-center text-zinc-400 shadow-2xl flex-shrink-0">
              <Music className="w-14 h-14 sm:w-20 sm:h-20 text-[#1db954]" />
            </div>

            <div className="space-y-1.5 sm:space-y-2 flex-1">
              <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-zinc-300">
                Personal Playlist
              </span>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tight">
                {currentPlaylist.name}
              </h1>
              <p className="text-xs text-zinc-300">{currentPlaylist.description}</p>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-zinc-300 font-medium">
                <span className="font-bold text-white">{currentUser?.name || 'Fedora Tunes'}</span>
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
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all"
                title="Play Playlist"
              >
                <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-black ml-0.5 sm:ml-1" />
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
            <div className="text-center py-12 sm:py-16 text-zinc-500 space-y-3 p-4">
              <ListPlus className="w-10 h-10 sm:w-12 sm:h-12 mx-auto stroke-zinc-600" />
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

      {/* ================= 5. COMPREHENSIVE LIBRARY VIEW (MOBILE & DESKTOP) ================= */}
      {activeTab === 'library' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 text-black flex items-center justify-center font-black text-base shadow-lg shadow-green-500/15">
                {(currentUser?.name || 'F').charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  Your Library
                </h1>
                <p className="text-xs text-zinc-400">
                  {playlists.length + (favorites.length > 0 ? 1 : 0)} collections • {songs.length} total tracks
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsCreatePlaylistOpen(true)}
                className="flex items-center gap-1.5 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold text-xs px-4 py-2 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Playlist</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 bg-[#242424] hover:bg-[#2c2c2c] text-white font-semibold text-xs px-3.5 py-2 rounded-full border border-white/10 hover:border-white/20 active:scale-95 transition-all"
              >
                <UploadCloud className="w-4 h-4 text-[#1db954]" />
                <span className="hidden xs:inline">Upload Song</span>
                <span className="xs:hidden">Upload</span>
              </button>
            </div>
          </div>

          {/* Library Sub-Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'playlists', label: `Playlists (${playlists.length})` },
              { id: 'liked', label: `Liked Songs (${favorites.length})` },
              { id: 'tracks', label: `All Tracks (${songs.length})` }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setLibraryFilter(filter.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  libraryFilter === filter.id
                    ? 'bg-white text-black font-bold shadow'
                    : 'bg-[#242424] text-zinc-300 hover:bg-[#2c2c2c] hover:text-white'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Section 1: Playlists & Collections Grid */}
          {(libraryFilter === 'all' || libraryFilter === 'playlists' || libraryFilter === 'liked') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
                  {libraryFilter === 'liked' ? 'Liked Collection' : 'Playlists & Collections'}
                </h3>
                {playlists.length > 0 && libraryFilter !== 'liked' && (
                  <button
                    onClick={() => setIsCreatePlaylistOpen(true)}
                    className="text-xs text-[#1db954] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create playlist</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                {/* 1. Pinned Liked Songs Card */}
                {(libraryFilter === 'all' || libraryFilter === 'liked') && (
                  <div
                    onClick={() => {
                      setActiveTab('liked');
                      setSelectedPlaylistId(null);
                    }}
                    className="group flex items-center gap-3.5 p-3 rounded-xl bg-gradient-to-r from-indigo-950/80 via-purple-950/40 to-[#181818] border border-indigo-500/20 hover:border-indigo-500/40 cursor-pointer transition-all hover:bg-white/5 active:scale-[0.98] shadow-md"
                  >
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-400 flex items-center justify-center text-white flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                      <Heart className="w-7 h-7 fill-white drop-shadow" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Pinned</span>
                      </div>
                      <h4 className="font-bold text-sm text-white truncate group-hover:text-[#1db954] transition-colors">
                        Liked Songs
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Playlist • {favorites.length} songs
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#1db954] text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 shadow mr-1">
                      <Play className="w-4 h-4 fill-black ml-0.5" />
                    </div>
                  </div>
                )}

                {/* 2. User Playlists Cards */}
                {(libraryFilter === 'all' || libraryFilter === 'playlists') && playlists.map(pl => {
                  const firstSong = songs.find(s => pl.songs?.includes(s.id));
                  return (
                    <div
                      key={pl.id}
                      onClick={() => {
                        setActiveTab('playlist');
                        setSelectedPlaylistId(pl.id);
                      }}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-[#181818] hover:bg-[#222222] border border-white/5 hover:border-white/10 cursor-pointer transition-all active:scale-[0.98] shadow-md"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-14 h-14 rounded-lg bg-[#282828] overflow-hidden flex items-center justify-center text-zinc-400 flex-shrink-0 shadow group-hover:scale-105 transition-transform">
                          {firstSong?.coverUrl ? (
                            <img
                              src={firstSong.coverUrl}
                              alt={pl.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/covers/default.svg';
                              }}
                            />
                          ) : (
                            <ListMusic className="w-7 h-7 text-[#1db954]" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-white truncate group-hover:text-[#1db954] transition-colors">
                            {pl.name}
                          </h4>
                          <p className="text-xs text-zinc-400 truncate">
                            Playlist • {pl.songs?.length || 0} songs
                          </p>
                          {pl.description && (
                            <p className="text-[11px] text-zinc-500 truncate hidden sm:block">
                              {pl.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delete Playlist Option */}
                      {pl.id !== 'default-favorites' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete playlist "${pl.name}"?`)) {
                              deletePlaylist(pl.id);
                            }
                          }}
                          className="p-2 text-zinc-500 hover:text-red-400 rounded-full hover:bg-white/10 transition-colors opacity-70 group-hover:opacity-100"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* 3. Create Playlist Quick Card */}
                {(libraryFilter === 'all' || libraryFilter === 'playlists') && (
                  <div
                    onClick={() => setIsCreatePlaylistOpen(true)}
                    className="flex items-center gap-3.5 p-3 rounded-xl border border-dashed border-white/15 hover:border-[#1db954]/50 bg-white/[0.02] hover:bg-[#1db954]/5 cursor-pointer transition-all active:scale-[0.98] group"
                  >
                    <div className="w-14 h-14 rounded-lg bg-[#242424] group-hover:bg-[#1db954]/20 border border-white/10 group-hover:border-[#1db954]/30 flex items-center justify-center text-zinc-400 group-hover:text-[#1db954] flex-shrink-0 transition-colors">
                      <Plus className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white group-hover:text-[#1db954] transition-colors">
                        Create Playlist
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Tap to create a new mix
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 2: All Tracks Collection */}
          {(libraryFilter === 'all' || libraryFilter === 'tracks') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
                  All Tracks ({songs.length})
                </h3>
                <span className="text-xs text-zinc-500">Tap to play</span>
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
      )}
    </div>
  );
}

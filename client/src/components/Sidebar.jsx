import React from 'react';
import { 
  Home, 
  Search, 
  Library, 
  Plus, 
  Heart, 
  UploadCloud, 
  Music2, 
  ListMusic, 
  Trash2, 
  FolderCheck,
  Disc3,
  Sliders
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatFileSize } from '../utils/formatters';

export default function Sidebar() {
  const { 
    activeTab, 
    setActiveTab, 
    playlists, 
    selectedPlaylistId, 
    setSelectedPlaylistId,
    favorites,
    songs,
    setIsUploadModalOpen,
    setIsCreatePlaylistOpen,
    deletePlaylist,
    setIsEqualizerOpen,
    stats
  } = useMusic();

  const handleSelectPlaylist = (id) => {
    setActiveTab('playlist');
    setSelectedPlaylistId(id);
  };

  const handleSelectLiked = () => {
    setActiveTab('liked');
    setSelectedPlaylistId(null);
  };

  return (
    <aside className="w-64 bg-black flex flex-col gap-2 p-2 select-none h-full text-zinc-400 text-sm font-medium">
      {/* Top Main Navigation Box */}
      <div className="bg-[#121212] rounded-lg p-4 flex flex-col gap-4">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg shadow-green-500/20">
            <Disc3 className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="text-white font-bold text-lg tracking-tight flex items-center gap-1.5">
              Fedora<span className="text-[#1db954]">Spotify</span>
            </div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
              Master Player
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 mt-1">
          <button
            onClick={() => { setActiveTab('home'); setSelectedPlaylistId(null); }}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors ${
              activeTab === 'home' 
                ? 'text-white font-bold bg-white/10' 
                : 'hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </button>

          <button
            onClick={() => { setActiveTab('search'); setSelectedPlaylistId(null); }}
            className={`flex items-center gap-4 px-3 py-2.5 rounded-md transition-colors ${
              activeTab === 'search' 
                ? 'text-white font-bold bg-white/10' 
                : 'hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </button>
        </nav>
      </div>

      {/* Your Library Box */}
      <div className="bg-[#121212] rounded-lg p-3 flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Library Header */}
        <div className="flex items-center justify-between px-2 py-2 text-zinc-400">
          <button 
            onClick={() => { setActiveTab('library'); setSelectedPlaylistId(null); }}
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Library className="w-5 h-5" />
            <span className="font-bold text-white text-base">Your Library</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCreatePlaylistOpen(true)}
              title="Create playlist"
              className="p-1.5 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              title="Upload Songs"
              className="p-1.5 hover:text-[#1db954] hover:bg-white/10 rounded-full transition-colors"
            >
              <UploadCloud className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Upload Action Pill */}
        <div className="px-2 my-1.5">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="w-full bg-[#1db954]/10 hover:bg-[#1db954]/20 border border-[#1db954]/30 text-[#1db954] hover:text-white py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-xs font-semibold transition-all group"
          >
            <UploadCloud className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Upload Downloaded Songs</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs overflow-x-auto no-scrollbar">
          <button 
            onClick={() => { setActiveTab('home'); }}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'home' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            All Tracks ({songs.length})
          </button>
          <button 
            onClick={handleSelectLiked}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'liked' ? 'bg-white text-black' : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
            }`}
          >
            Liked ({favorites.length})
          </button>
        </div>

        {/* Playlists & Items List */}
        <div className="flex-1 overflow-y-auto mt-2 pr-1 space-y-1">
          {/* Liked Songs Pinned Item */}
          <div
            onClick={handleSelectLiked}
            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
              activeTab === 'liked' ? 'bg-[#282828] text-white' : 'hover:bg-[#1a1a1a]'
            }`}
          >
            <div className="w-11 h-11 rounded bg-gradient-to-br from-indigo-700 via-purple-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold truncate text-sm ${activeTab === 'liked' ? 'text-[#1db954]' : 'text-white'}`}>
                Liked Songs
              </p>
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <span>Playlist</span>
                <span>•</span>
                <span>{favorites.length} songs</span>
              </p>
            </div>
          </div>

          {/* User Playlists */}
          {playlists.map(pl => {
            const isSelected = activeTab === 'playlist' && selectedPlaylistId === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => handleSelectPlaylist(pl.id)}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer group transition-colors ${
                  isSelected ? 'bg-[#282828] text-white' : 'hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded bg-[#282828] flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate text-sm ${isSelected ? 'text-[#1db954]' : 'text-white'}`}>
                      {pl.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      Playlist • {pl.songs.length} songs
                    </p>
                  </div>
                </div>

                {pl.id !== 'default-favorites' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete playlist "${pl.name}"?`)) {
                        deletePlaylist(pl.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-400 transition-opacity"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Library Stats Footer */}
        <div className="pt-2 mt-auto border-t border-white/5 px-2 flex items-center justify-between text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <FolderCheck className="w-3.5 h-3.5 text-[#1db954]" />
            <span>Songs Folder Active</span>
          </div>
          {stats && (
            <span className="text-zinc-400">{formatFileSize(stats.totalSize)}</span>
          )}
        </div>
      </div>
    </aside>
  );
}


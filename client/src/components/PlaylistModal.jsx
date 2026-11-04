import React, { useState } from 'react';
import { X, ListMusic, Sparkles } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function PlaylistModal() {
  const { isCreatePlaylistOpen, setIsCreatePlaylistOpen, createPlaylist, setSelectedPlaylistId, setActiveTab } = useMusic();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isCreatePlaylistOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const pl = await createPlaylist(name.trim(), description.trim());
      if (pl) {
        setSelectedPlaylistId(pl.id);
        setActiveTab('playlist');
        setIsCreatePlaylistOpen(false);
        setName('');
        setDescription('');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col gap-4 sm:gap-5 text-white animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 flex items-center justify-center text-[#1db954]">
              <ListMusic className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-lg text-white">Create New Playlist</h2>
          </div>
          <button
            onClick={() => setIsCreatePlaylistOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Playlist Name <span className="text-[#1db954]">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Driving Vibes, Late Night Chill"
              className="w-full bg-[#242424] text-white text-sm rounded-lg px-3.5 py-2.5 outline-none border border-transparent focus:border-[#1db954] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Give your playlist a cool description..."
              className="w-full bg-[#242424] text-white text-sm rounded-lg px-3.5 py-2.5 outline-none border border-transparent focus:border-[#1db954] transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
            <button
              type="button"
              onClick={() => setIsCreatePlaylistOpen(false)}
              className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || loading}
              className="bg-[#1db954] hover:bg-[#1ed760] disabled:bg-zinc-700 disabled:text-zinc-500 text-black px-6 py-2 rounded-full font-bold text-xs shadow-lg transition-transform hover:scale-105"
            >
              {loading ? 'Creating...' : 'Create Playlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  UploadCloud, 
  Sliders, 
  Sparkles,
  Music,
  ShieldCheck
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime } from '../utils/formatters';

export default function TopNav() {
  const { 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab, 
    selectedCategory, 
    setSelectedCategory,
    setIsUploadModalOpen,
    setIsEqualizerOpen,
    stats
  } = useMusic();

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'bollywood', label: 'Bollywood Hits' },
    { id: 'devotional', label: 'Devotional & Bhajans' },
    { id: 'punjabi', label: 'Punjabi Beats' },
    { id: 'gujarati', label: 'Gujarati Folk' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 bg-[#121212]/80 backdrop-blur-md border-b border-white/5 transition-all">
      {/* Left: Navigation and Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.history.back()}
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => window.history.forward()}
            className="w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Go forward"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (activeTab !== 'search' && e.target.value.trim().length > 0) {
                // Keep on current tab or allow search anywhere
              }
            }}
            placeholder="What do you want to play? (Song, Artist, Album)"
            className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white text-sm rounded-full pl-10 pr-9 py-2 outline-none border border-transparent focus:border-white/20 transition-all placeholder:text-zinc-400 placeholder:text-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Center Category Filters (When on Home) */}
      {activeTab === 'home' && (
        <div className="hidden lg:flex items-center gap-2 mx-4 overflow-x-auto no-scrollbar py-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-black shadow-sm'
                  : 'bg-[#242424] text-zinc-300 hover:bg-[#303030] hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Right Controls & Profile */}
      <div className="flex items-center gap-3">
        {/* Equalizer FX Button */}
        <button
          onClick={() => setIsEqualizerOpen(true)}
          className="flex items-center gap-1.5 bg-[#242424] hover:bg-[#2e2e2e] text-zinc-300 hover:text-[#1db954] px-3 py-1.5 rounded-full text-xs font-semibold border border-white/5 transition-all"
          title="Audio Equalizer & Presets"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Equalizer</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-[#1db954] hover:bg-[#1ed760] text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-md shadow-green-500/10 hover:scale-105 active:scale-95 transition-all"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload</span>
        </button>

        {/* User / Session Avatar */}
        <div className="flex items-center gap-2 bg-[#242424] hover:bg-[#2c2c2c] p-1 pr-3 rounded-full border border-white/5 cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 text-black flex items-center justify-center font-bold text-xs shadow-inner">
            F
          </div>
          <span className="text-xs font-medium text-white hidden md:inline">Fedora</span>
        </div>
      </div>
    </header>
  );
}


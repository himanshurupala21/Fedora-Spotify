import React from 'react';
import { Home, Search, Library, UploadCloud, Heart } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function MobileNav() {
  const { 
    activeTab, 
    setActiveTab, 
    setSelectedPlaylistId,
    setIsUploadModalOpen 
  } = useMusic();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-14 bg-black/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around px-2 text-[10px] font-medium text-zinc-400 select-none md:hidden">
      {/* Home */}
      <button
        onClick={() => {
          setActiveTab('home');
          setSelectedPlaylistId(null);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
          activeTab === 'home' ? 'text-white font-bold' : 'hover:text-white'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'text-[#1db954]' : ''}`} />
        <span>Home</span>
      </button>

      {/* Search */}
      <button
        onClick={() => {
          setActiveTab('search');
          setSelectedPlaylistId(null);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
          activeTab === 'search' ? 'text-white font-bold' : 'hover:text-white'
        }`}
      >
        <Search className={`w-5 h-5 ${activeTab === 'search' ? 'text-[#1db954]' : ''}`} />
        <span>Search</span>
      </button>

      {/* Your Library */}
      <button
        onClick={() => {
          setActiveTab('library');
          setSelectedPlaylistId(null);
        }}
        className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
          activeTab === 'library' || activeTab === 'liked' || activeTab === 'playlist' 
            ? 'text-white font-bold' 
            : 'hover:text-white'
        }`}
      >
        <Library className={`w-5 h-5 ${
          activeTab === 'library' || activeTab === 'liked' || activeTab === 'playlist' 
            ? 'text-[#1db954]' 
            : ''
        }`} />
        <span>Library</span>
      </button>

      {/* Upload */}
      <button
        onClick={() => setIsUploadModalOpen(true)}
        className="flex flex-col items-center justify-center flex-1 py-1 gap-1 text-zinc-400 hover:text-[#1db954] transition-colors"
      >
        <UploadCloud className="w-5 h-5" />
        <span>Upload</span>
      </button>
    </nav>
  );
}

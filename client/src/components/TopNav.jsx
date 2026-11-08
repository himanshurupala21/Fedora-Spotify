import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  X, 
  UploadCloud, 
  Sliders, 
  Disc3,
  ShieldCheck,
  LogOut,
  User,
  Key
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import AdminManagerModal from './AdminManagerModal';
import ProfileModal from './ProfileModal';

export default function TopNav() {
  const { 
    searchQuery, 
    setSearchQuery, 
    activeTab, 
    setActiveTab, 
    selectedCategory, 
    setSelectedCategory,
    setIsUploadModalOpen,
    setIsEqualizerOpen
  } = useMusic();

  const { currentUser, isAdmin, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'bollywood', label: 'Bollywood' },
    { id: 'devotional', label: 'Devotional' },
    { id: 'punjabi', label: 'Punjabi' },
    { id: 'gujarati', label: 'Gujarati' },
  ];

  const userInitial = (currentUser?.name || 'F').charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-20 flex flex-col bg-[#121212]/95 backdrop-blur-md border-b border-white/5 transition-all select-none">
        {/* Upper Bar: Search + Navigation + Actions */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 gap-2 sm:gap-4">
          {/* Left: Brand Icon (mobile) or History Nav (desktop) */}
          <div className="flex items-center gap-2">
            {/* Mobile brand logo */}
            <div 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2 md:hidden cursor-pointer mr-1"
            >
              <div className="w-7 h-7 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow">
                <Disc3 className="w-4 h-4 animate-spin-slow" />
              </div>
              <span className="font-bold text-sm text-white hidden xs:inline tracking-tight">
                Fedora<span className="text-[#1db954]">Tunes</span>
              </span>
            </div>

            {/* Desktop Back/Forward */}
            <div className="hidden sm:flex items-center gap-1.5">
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
          </div>

          {/* Center: Search Bar */}
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-white transition-colors pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search songs, artists, albums..."
              className="w-full bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white text-xs sm:text-sm rounded-full pl-9 pr-8 py-1.5 sm:py-2 outline-none border border-transparent focus:border-white/20 transition-all placeholder:text-zinc-400 placeholder:text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
            {/* Equalizer Button */}
            <button
              onClick={() => setIsEqualizerOpen(true)}
              className="flex items-center gap-1 bg-[#242424] hover:bg-[#2e2e2e] text-zinc-300 hover:text-[#1db954] p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold border border-white/5 transition-all"
              title="Audio Equalizer & Sound FX"
            >
              <Sliders className="w-4 h-4 text-[#1db954]" />
              <span className="hidden md:inline">EQ</span>
            </button>

            {/* Upload Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#1db954] hover:bg-[#1ed760] text-black px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md shadow-green-500/10 active:scale-95 transition-all"
              title="Upload Song"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </button>

            {/* User Profile Avatar with Dropdown */}
            <div className="relative" ref={profileRef}>
              <div 
                onClick={() => setIsProfileMenuOpen(prev => !prev)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 text-black flex items-center justify-center font-bold text-xs shadow-inner cursor-pointer hover:scale-105 transition-transform"
                title={currentUser?.name || 'Account'}
              >
                {userInitial}
              </div>

              {/* Profile Popover Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-10 w-56 bg-[#242424] border border-white/10 rounded-2xl shadow-2xl p-2 z-50 text-xs text-zinc-300 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="font-bold text-white text-sm truncate">{currentUser?.name || 'Fedora User'}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{currentUser?.email || ''}</p>
                    {isAdmin && (
                      <span className="inline-block mt-1 bg-[#1db954]/20 text-[#1db954] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Admin / Owner
                      </span>
                    )}
                  </div>

                  <div className="py-1 space-y-0.5">
                    {/* View Profile Button */}
                    <button
                      onClick={() => {
                        setIsProfileModalOpen(true);
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg flex items-center gap-2 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-[#1db954]" />
                      <span>View My Profile</span>
                    </button>

                    {/* Admin Access Manager link (Admin only) */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsAdminModalOpen(true);
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left rounded-lg flex items-center gap-2 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#1db954]" />
                        <span>Access Requests Manager</span>
                      </button>
                    )}

                    {/* Lock / Log out */}
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left rounded-lg flex items-center gap-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Lock App / Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills Bar (Horizontal scroll on all screen sizes on Home) */}
        {activeTab === 'home' && (
          <div className="flex items-center gap-2 px-3 sm:px-6 pb-2.5 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-white text-black shadow-sm font-bold'
                    : 'bg-[#242424] text-zinc-300 hover:bg-[#303030] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Profile Details Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Admin Requests Manager Modal */}
      <AdminManagerModal 
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </>
  );
}

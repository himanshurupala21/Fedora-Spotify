import React from 'react';
import { MusicProvider } from './context/MusicContext';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import MainView from './components/MainView';
import RightPanel from './components/RightPanel';
import Player from './components/Player';
import MobileNav from './components/MobileNav';
import UploadModal from './components/UploadModal';
import PlaylistModal from './components/PlaylistModal';
import EqualizerModal from './components/EqualizerModal';
import FullscreenPlayer from './components/FullscreenPlayer';

function MusicPlayerApp() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white select-none">
      {/* Upper Area: Sidebar + Main Content + Right Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar (Desktop/Tablet) */}
        <Sidebar />

        {/* Center Main Content */}
        <main className="flex-1 flex flex-col bg-[#121212] m-0 md:my-2 md:mr-2 rounded-none md:rounded-lg overflow-hidden border-0 md:border border-white/5 relative">
          <TopNav />
          <MainView />
        </main>

        {/* Right Info / Visualizer / Lyrics / Queue Panel */}
        <RightPanel />
      </div>

      {/* Bottom Audio Player Bar */}
      <Player />

      {/* Mobile Navigation Bar (Home / Search / Library / Upload) */}
      <MobileNav />

      {/* Modals & Fullscreen Player */}
      <UploadModal />
      <PlaylistModal />
      <EqualizerModal />
      <FullscreenPlayer />
    </div>
  );
}

export default function App() {
  return (
    <MusicProvider>
      <MusicPlayerApp />
    </MusicProvider>
  );
}

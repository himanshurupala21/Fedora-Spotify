import React from 'react';
import { MusicProvider } from './context/MusicContext';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import MainView from './components/MainView';
import RightPanel from './components/RightPanel';
import Player from './components/Player';
import UploadModal from './components/UploadModal';
import PlaylistModal from './components/PlaylistModal';
import EqualizerModal from './components/EqualizerModal';
import FullscreenPlayer from './components/FullscreenPlayer';

function MusicPlayerApp() {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white select-none">
      {/* Upper Area: Sidebar + Main Content + Right Panel */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Main Stage */}
        <main className="flex-1 flex flex-col bg-[#121212] rounded-lg my-2 mr-2 overflow-hidden border border-white/5 relative">
          <TopNav />
          <MainView />
        </main>

        {/* Right Info / Visualizer / Lyrics / Queue Panel */}
        <RightPanel />
      </div>

      {/* Bottom Sticky Player Bar */}
      <Player />

      {/* Modals & Overlays */}
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

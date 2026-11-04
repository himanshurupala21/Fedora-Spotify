import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  Activity, 
  ListMusic, 
  Mic2, 
  Disc, 
  Heart, 
  Trash2, 
  FileAudio,
  Download,
  Share2
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatTime, formatFileSize } from '../utils/formatters';

export default function RightPanel() {
  const {
    rightPanelTab,
    setRightPanelTab,
    currentSong,
    isPlaying,
    analyserRef,
    queue,
    removeFromQueue,
    clearQueue,
    playSong,
    isFavorite,
    toggleFavorite
  } = useMusic();

  const [visualizerMode, setVisualizerMode] = useState('bars'); // 'bars' | 'wave'
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Close panel
  const handleClose = () => setRightPanelTab(null);

  // Real-time Canvas Visualizer Loop
  useEffect(() => {
    if (rightPanelTab !== 'visualizer' || !canvasRef.current) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const analyser = analyserRef.current;

    let bufferLength = 64;
    let dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Subtle ambient idle wave when paused
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.sin((Date.now() / 600) + (i / 4)) * 20 + 25;
        }
      }

      if (visualizerMode === 'bars') {
        const barWidth = (width / bufferLength) * 1.6;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (height * 0.85);

          // Spotify Green Gradient
          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, '#1db954');
          grad.addColorStop(0.6, '#1ed760');
          grad.addColorStop(1, '#a8ff78');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, height - barHeight, barWidth - 2, barHeight, [4, 4, 0, 0]);
          ctx.fill();

          x += barWidth;
        }
      } else {
        // Smooth waveform line
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#1ed760';

        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 255;
          const y = (1 - v) * height;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }
        ctx.stroke();
      }
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [rightPanelTab, isPlaying, visualizerMode, analyserRef]);

  if (!rightPanelTab || !currentSong) return null;

  return (
    <>
      {/* Mobile/Tablet Backdrop (< lg) */}
      <div 
        onClick={handleClose}
        className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
      />

      <aside className="fixed inset-y-0 right-0 z-50 w-full sm:w-80 lg:relative lg:inset-auto lg:z-auto bg-[#121212] lg:rounded-lg p-4 lg:my-2 lg:mr-2 flex flex-col gap-4 border-l lg:border border-white/10 shadow-2xl overflow-hidden select-none animate-in slide-in-from-right duration-200">
        {/* Top Header / Switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRightPanelTab('nowplaying')}
            className={`font-bold transition-colors ${
              rightPanelTab === 'nowplaying' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Overview
          </button>
          <span>•</span>
          <button
            onClick={() => setRightPanelTab('visualizer')}
            className={`font-bold transition-colors ${
              rightPanelTab === 'visualizer' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Visualizer
          </button>
          <span>•</span>
          <button
            onClick={() => setRightPanelTab('lyrics')}
            className={`font-bold transition-colors ${
              rightPanelTab === 'lyrics' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Lyrics
          </button>
          <span>•</span>
          <button
            onClick={() => setRightPanelTab('queue')}
            className={`font-bold transition-colors ${
              rightPanelTab === 'queue' ? 'text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Queue ({queue.length})
          </button>
        </div>

        <button
          onClick={handleClose}
          className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          title="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 1. Now Playing Overview Tab */}
      {rightPanelTab === 'nowplaying' && (
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-800 shadow-2xl relative group">
            <img
              src={currentSong.coverUrl || '/covers/default.svg'}
              alt={currentSong.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/covers/default.svg';
              }}
            />
          </div>

          <div>
            <h3 className="font-bold text-lg text-white truncate">{currentSong.title}</h3>
            <p className="text-sm text-zinc-400 truncate">{currentSong.artist}</p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(currentSong.id)}
              className={`flex-1 py-2 rounded-full font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                isFavorite(currentSong.id)
                  ? 'bg-[#1db954]/20 border-[#1db954] text-[#1db954]'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite(currentSong.id) ? 'fill-[#1db954]' : ''}`} />
              <span>{isFavorite(currentSong.id) ? 'Liked' : 'Like'}</span>
            </button>

            <a
              href={currentSong.audioUrl}
              download={currentSong.filename}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-300 hover:text-white border border-white/10"
              title="Download Song"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>

          {/* Audio Metadata Information Card */}
          <div className="bg-[#181818] p-3.5 rounded-lg border border-white/5 space-y-2.5 text-xs">
            <h4 className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <FileAudio className="w-4 h-4 text-[#1db954]" />
              <span>Track Details</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-zinc-400">
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Album</span>
                <span className="text-zinc-200 truncate block">{currentSong.album || 'Single'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Duration</span>
                <span className="text-zinc-200">{formatTime(currentSong.duration)}</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">Bitrate</span>
                <span className="text-zinc-200">{currentSong.bitrate || 320} kbps</span>
              </div>
              <div>
                <span className="text-zinc-500 block text-[10px] uppercase">File Size</span>
                <span className="text-zinc-200">{formatFileSize(currentSong.size)}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500 block text-[10px] uppercase">File Name</span>
                <span className="text-zinc-300 font-mono text-[11px] truncate block">{currentSong.filename}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Visualizer Tab */}
      {rightPanelTab === 'visualizer' && (
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-[#1db954]" />
              Live Spectrum
            </span>
            <div className="flex gap-1 bg-[#242424] p-0.5 rounded-md">
              <button
                onClick={() => setVisualizerMode('bars')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  visualizerMode === 'bars' ? 'bg-[#1db954] text-black' : 'text-zinc-400'
                }`}
              >
                Bars
              </button>
              <button
                onClick={() => setVisualizerMode('wave')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  visualizerMode === 'wave' ? 'bg-[#1db954] text-black' : 'text-zinc-400'
                }`}
              >
                Wave
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#181818] rounded-lg p-3 flex flex-col justify-end border border-white/5 relative overflow-hidden">
            <canvas
              ref={canvasRef}
              width={260}
              height={280}
              className="w-full h-full block"
            />
          </div>

          <div className="text-center text-xs text-zinc-400">
            {isPlaying ? (
              <span className="text-[#1db954] flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#1db954] animate-ping inline-block" />
                Analyzing live Web Audio output
              </span>
            ) : (
              <span>Play a track to activate real-time audio visualization</span>
            )}
          </div>
        </div>
      )}

      {/* 3. Lyrics Tab */}
      {rightPanelTab === 'lyrics' && (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-[#242424] to-[#121212] rounded-lg p-4 text-center overflow-y-auto">
          <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">
            Lyrics Mode
          </div>
          <div className="space-y-6 text-sm font-semibold">
            <p className="text-zinc-400">{currentSong.title}</p>
            <p className="text-white text-lg font-bold text-[#1db954]">
              ♪ {currentSong.title} ♪
            </p>
            <p className="text-zinc-300">Performed by {currentSong.artist}</p>
            <p className="text-zinc-400">Album: {currentSong.album || 'Single'}</p>
            <p className="text-xs text-zinc-400 italic pt-6">
              (Live synced lyrics will match your song tags or online sync)
            </p>
          </div>
        </div>
      )}

      {/* 4. Queue Tab */}
      {rightPanelTab === 'queue' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Next In Queue
            </span>
            {queue.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-red-400 hover:text-red-300 font-semibold"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {queue.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-xs">
                Queue is empty. Use "Add to Queue" from any song options menu!
              </div>
            ) : (
              queue.map((song, i) => (
                <div
                  key={`${song.id}-${i}`}
                  onClick={() => playSong(song)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-white/10 group cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={song.coverUrl}
                      alt={song.title}
                      className="w-9 h-9 rounded object-cover bg-zinc-800"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{song.title}</p>
                      <p className="text-[11px] text-zinc-400 truncate">{song.artist}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromQueue(i);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-400 transition-opacity"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      </aside>
    </>
  );
}


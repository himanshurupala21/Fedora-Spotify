import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Smartphone, 
  Laptop, 
  Apple, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles, 
  Radio, 
  Zap, 
  ShieldCheck,
  Disc3
} from 'lucide-react';

export default function InstallAppModal({ isOpen, onClose, deferredPrompt, onInstallSuccess }) {
  // Device detection
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') return 'android';
    const ua = navigator.userAgent || '';
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/android/i.test(ua)) return 'android';
    return 'desktop';
  });

  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      setIsStandalone(standalone);
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          if (onInstallSuccess) onInstallSuccess();
          onClose();
        }
      } catch (err) {
        console.warn('Install error:', err);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-[#181818] border border-white/10 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col gap-5 text-white animate-in zoom-in-95 duration-200 relative overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-[#1db954]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 flex items-center justify-center text-[#1db954]">
              <Download className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg text-white">Download Application</h2>
              <p className="text-[11px] text-zinc-400">Install Fedora Spotify on Mobile or PC</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* App Showcase Card */}
        <div className="relative z-10 flex items-center gap-4 bg-gradient-to-r from-emerald-950/70 via-[#222] to-[#1a1a1a] p-4 rounded-2xl border border-[#1db954]/30 shadow-lg">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1ed760] to-[#128a3e] flex items-center justify-center text-black shadow-lg shadow-green-500/20 flex-shrink-0 relative overflow-hidden">
            <Disc3 className="w-8 h-8 animate-spin-slow" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white tracking-tight">Fedora Spotify</h3>
              <span className="bg-[#1db954] text-black font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                App
              </span>
            </div>
            <p className="text-xs text-zinc-300">Fast, High-Fidelity & Zero Ads</p>
            <p className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
              <span>✓ Works on all devices</span>
              <span>•</span>
              <span>✓ Offline ready</span>
            </p>
          </div>
        </div>

        {/* 1-Click Install Button if supported */}
        {deferredPrompt && !isStandalone && (
          <button
            onClick={handleInstallClick}
            className="relative z-10 w-full bg-[#1db954] hover:bg-[#1ed760] text-black py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-green-500/25 active:scale-98 transition-all hover:scale-[1.02]"
          >
            <Download className="w-5 h-5 stroke-[2.5]" />
            <span>Install App on this Device (1-Click)</span>
          </button>
        )}

        {/* Device Segmented Tabs */}
        <div className="relative z-10 flex bg-[#242424] p-1 rounded-2xl border border-white/5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'android'
                ? 'bg-[#1db954] text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ios'
                ? 'bg-[#1db954] text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone / iPad</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'desktop'
                ? 'bg-[#1db954] text-black shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>PC / Mac</span>
          </button>
        </div>

        {/* Tab Guides */}
        <div className="relative z-10 space-y-3 bg-[#202020] p-4 rounded-2xl border border-white/5 text-xs text-zinc-300">
          {/* ANDROID GUIDE */}
          {activeTab === 'android' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#1db954]" />
                <span>How to Install on Android Phone & Tablet</span>
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                    1
                  </span>
                  <p>
                    Open this URL in <span className="text-white font-semibold">Chrome</span>, <span className="text-white font-semibold">Brave</span>, or <span className="text-white font-semibold">Samsung Internet</span>.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                    2
                  </span>
                  <p>
                    Tap the <strong>three dots menu</strong> (<span className="text-white font-mono">⋮</span>) at the top right of your browser.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1db954] flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0">
                    3
                  </span>
                  <p>
                    Tap <span className="text-[#1db954] font-bold">"Install app"</span> or <span className="text-[#1db954] font-bold">"Add to Home screen"</span>.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#181818] rounded-xl border border-white/5 flex items-center gap-2 text-[11px] text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-[#1db954] flex-shrink-0" />
                <span>The Fedora Spotify icon will appear on your home screen and app drawer!</span>
              </div>
            </div>
          )}

          {/* IOS GUIDE */}
          {activeTab === 'ios' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Apple className="w-4 h-4 text-[#1db954]" />
                <span>How to Install on iPhone & iPad (Safari)</span>
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                    1
                  </span>
                  <p>
                    Open this page in <span className="text-white font-semibold">Safari</span> on your iPhone or iPad.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                    2
                  </span>
                  <p>
                    Tap the <span className="text-white font-bold">Share icon</span> (<Share className="w-3.5 h-3.5 inline text-[#1db954]" />) in Safari's bottom toolbar.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1db954] flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0">
                    3
                  </span>
                  <p>
                    Scroll down and tap <span className="text-[#1db954] font-bold">"Add to Home Screen"</span> (<PlusSquare className="w-3.5 h-3.5 inline text-white" />), then tap <span className="text-white font-bold">"Add"</span>.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#181818] rounded-xl border border-white/5 flex items-center gap-2 text-[11px] text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-[#1db954] flex-shrink-0" />
                <span>Runs full-screen with native iOS audio controls and lock-screen widget!</span>
              </div>
            </div>
          )}

          {/* DESKTOP GUIDE */}
          {activeTab === 'desktop' && (
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Laptop className="w-4 h-4 text-[#1db954]" />
                <span>How to Install on Windows PC & Mac</span>
              </h4>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                    1
                  </span>
                  <p>
                    In <span className="text-white font-semibold">Google Chrome</span> or <span className="text-white font-semibold">Microsoft Edge</span>, look at the right end of the address URL bar.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
                    2
                  </span>
                  <p>
                    Click the <span className="text-white font-bold">Install App icon</span> (<span className="text-[#1db954] font-bold">⊕</span> or computer icon).
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#1db954] flex items-center justify-center text-[11px] font-bold text-black flex-shrink-0">
                    3
                  </span>
                  <p>
                    Click <span className="text-[#1db954] font-bold">"Install"</span> to launch Fedora Spotify as a standalone desktop window!
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-[#181818] rounded-xl border border-white/5 flex items-center gap-2 text-[11px] text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-[#1db954] flex-shrink-0" />
                <span>App opens from your desktop shortcut or Windows Start Menu / Mac Launchpad!</span>
              </div>
            </div>
          )}
        </div>

        {/* Feature Pills */}
        <div className="relative z-10 grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#242424]/70 p-2.5 rounded-2xl border border-white/5">
            <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <span className="font-bold text-xs text-white block">Instant</span>
            <span className="text-[10px] text-zinc-400">No App Store</span>
          </div>

          <div className="bg-[#242424]/70 p-2.5 rounded-2xl border border-white/5">
            <Radio className="w-4 h-4 text-[#1db954] mx-auto mb-1" />
            <span className="font-bold text-xs text-white block">Full Screen</span>
            <span className="text-[10px] text-zinc-400">No address bar</span>
          </div>

          <div className="bg-[#242424]/70 p-2.5 rounded-2xl border border-white/5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="font-bold text-xs text-white block">100% Free</span>
            <span className="text-[10px] text-zinc-400">Secure Access</span>
          </div>
        </div>

        {/* Close Button */}
        <div className="relative z-10 pt-2 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white hover:bg-zinc-200 text-black px-6 py-2 rounded-full font-bold text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

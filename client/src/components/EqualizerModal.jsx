import React from 'react';
import { X, Sliders, Volume2, Sparkles } from 'lucide-react';
import { useMusic } from '../context/MusicContext';

export default function EqualizerModal() {
  const { isEqualizerOpen, setIsEqualizerOpen, eqPreset, eqGains, applyEqPreset } = useMusic();

  if (!isEqualizerOpen) return null;

  const presets = [
    { id: 'flat', label: 'Flat / Standard' },
    { id: 'bass', label: 'Deep Bass Boost' },
    { id: 'vocal', label: 'Crisp Vocal & Acoustic' },
    { id: 'electronic', label: 'Electronic & Dance' },
    { id: 'rock', label: 'Rock & Stadium' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 flex items-center justify-center text-[#1db954]">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Audio Equalizer & FX</h2>
              <p className="text-xs text-zinc-400">Powered by Web Audio Biquad Filters</p>
            </div>
          </div>
          <button
            onClick={() => setIsEqualizerOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400">Sound Profile Presets</label>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(p => (
              <button
                key={p.id}
                onClick={() => applyEqPreset(p.id)}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold text-left transition-all ${
                  eqPreset === p.id
                    ? 'bg-[#1db954] text-black font-bold shadow-md shadow-green-500/20'
                    : 'bg-[#242424] text-zinc-300 hover:bg-[#2e2e2e] hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Gain Bars Indicator */}
        <div className="bg-[#242424] p-4 rounded-xl flex items-center justify-around text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-4 bg-zinc-800 rounded-full relative flex items-end overflow-hidden p-0.5">
              <div 
                className="w-full bg-[#1db954] rounded-full transition-all duration-300"
                style={{ height: `${Math.max(10, Math.min(100, (eqGains.bass + 10) * 5))}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-zinc-400">Bass</span>
            <span className="text-[10px] text-zinc-500 font-mono">{eqGains.bass > 0 ? `+${eqGains.bass}` : eqGains.bass}dB</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-4 bg-zinc-800 rounded-full relative flex items-end overflow-hidden p-0.5">
              <div 
                className="w-full bg-[#1db954] rounded-full transition-all duration-300"
                style={{ height: `${Math.max(10, Math.min(100, (eqGains.mid + 10) * 5))}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-zinc-400">Mids</span>
            <span className="text-[10px] text-zinc-500 font-mono">{eqGains.mid > 0 ? `+${eqGains.mid}` : eqGains.mid}dB</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-24 w-4 bg-zinc-800 rounded-full relative flex items-end overflow-hidden p-0.5">
              <div 
                className="w-full bg-[#1db954] rounded-full transition-all duration-300"
                style={{ height: `${Math.max(10, Math.min(100, (eqGains.treble + 10) * 5))}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-zinc-400">Treble</span>
            <span className="text-[10px] text-zinc-500 font-mono">{eqGains.treble > 0 ? `+${eqGains.treble}` : eqGains.treble}dB</span>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/5">
          <button
            onClick={() => setIsEqualizerOpen(false)}
            className="bg-white hover:bg-zinc-200 text-black px-6 py-2 rounded-full font-bold text-xs transition-transform hover:scale-105"
          >
            Apply & Done
          </button>
        </div>
      </div>
    </div>
  );
}


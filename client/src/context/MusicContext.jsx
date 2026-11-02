import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const MusicContext = createContext(null);

export function MusicProvider({ children }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('spotify_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isShuffle, setIsShuffle] = useState(() => {
    return localStorage.getItem('spotify_shuffle') === 'true';
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    return localStorage.getItem('spotify_repeat') || 'off'; // 'off' | 'all' | 'one'
  });
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);

  // UI Navigation states
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'search' | 'library' | 'liked' | 'playlist'
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [rightPanelTab, setRightPanelTab] = useState('nowplaying'); // 'nowplaying' | 'visualizer' | 'lyrics' | 'queue' | null
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState(null);

  // Equalizer presets & gains
  const [eqPreset, setEqPreset] = useState('balanced');
  const [eqGains, setEqGains] = useState({ bass: 0, mid: 0, treble: 0 });

  // Audio & Web Audio Refs
  const audioRef = useRef(new Audio());
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const bassFilterRef = useRef(null);
  const midFilterRef = useRef(null);
  const trebleFilterRef = useRef(null);

  // Fetch initial songs, playlists, favorites, stats
  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const [songsRes, plRes, favRes, statsRes] = await Promise.all([
        fetch('/api/songs').then(r => r.json()),
        fetch('/api/playlists').then(r => r.json()),
        fetch('/api/favorites').then(r => r.json()),
        fetch('/api/stats').then(r => r.json())
      ]);

      if (songsRes.success) {
        setSongs(songsRes.songs);
        if (!currentSong && songsRes.songs.length > 0) {
          // Restore last played song or default to first
          const savedSongId = localStorage.getItem('spotify_last_song');
          const found = songsRes.songs.find(s => s.id === savedSongId) || songsRes.songs[0];
          setCurrentSong(found);
          audioRef.current.src = found.audioUrl;
        }
      }

      if (plRes.success) setPlaylists(plRes.playlists);
      if (favRes.success) setFavorites(favRes.favorites);
      if (statsRes.success) setStats(statsRes.stats);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  // Web Audio Context setup for real-time visualizer & equalizer
  const setupWebAudio = () => {
    if (audioContextRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      // Equalizer filters (Biquad)
      const bass = ctx.createBiquadFilter();
      bass.type = 'lowshelf';
      bass.frequency.value = 250;
      bass.gain.value = eqGains.bass;
      bassFilterRef.current = bass;

      const mid = ctx.createBiquadFilter();
      mid.type = 'peaking';
      mid.frequency.value = 1500;
      mid.gain.value = eqGains.mid;
      midFilterRef.current = mid;

      const treble = ctx.createBiquadFilter();
      treble.type = 'highshelf';
      treble.frequency.value = 4000;
      treble.gain.value = eqGains.treble;
      trebleFilterRef.current = treble;

      const audio = audioRef.current;
      audio.crossOrigin = 'anonymous';

      const source = ctx.createMediaElementSource(audio);
      sourceNodeRef.current = source;

      // Pipeline: Source -> Bass -> Mid -> Treble -> Analyser -> Output
      source.connect(bass);
      bass.connect(mid);
      mid.connect(treble);
      treble.connect(analyser);
      analyser.connect(ctx.destination);
    } catch (err) {
      console.warn('Web Audio API initialization note:', err.message);
    }
  };

  // Equalizer presets handler
  const applyEqPreset = (presetName) => {
    setEqPreset(presetName);
    let gains = { bass: 0, mid: 0, treble: 0 };
    switch (presetName) {
      case 'bass':
        gains = { bass: 7, mid: -1, treble: 1 };
        break;
      case 'vocal':
        gains = { bass: -2, mid: 6, treble: 2 };
        break;
      case 'electronic':
        gains = { bass: 6, mid: 1, treble: 5 };
        break;
      case 'rock':
        gains = { bass: 5, mid: 3, treble: 4 };
        break;
      case 'flat':
      default:
        gains = { bass: 0, mid: 0, treble: 0 };
        break;
    }
    setEqGains(gains);
    if (bassFilterRef.current) bassFilterRef.current.gain.value = gains.bass;
    if (midFilterRef.current) midFilterRef.current.gain.value = gains.mid;
    if (trebleFilterRef.current) trebleFilterRef.current.gain.value = gains.treble;
  };

  // HTMLAudioElement event listeners
  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = isMuted ? 0 : volume;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => handleSongEnd();

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeatMode, queue, songs, isShuffle, isMuted, volume]);

  // Audio Playback Controls
  const playSong = async (song, newQueueList = null) => {
    if (!song) return;
    setupWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (currentSong && currentSong.id !== song.id) {
      setHistory(prev => [currentSong, ...prev.slice(0, 20)]);
    }

    setCurrentSong(song);
    localStorage.setItem('spotify_last_song', song.id);

    const audio = audioRef.current;
    if (audio.src !== window.location.origin + song.audioUrl && audio.src !== song.audioUrl) {
      audio.src = song.audioUrl;
      audio.load();
    }

    audio.playbackRate = playbackRate;
    audio.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.warn('Playback play request prevented:', err.message);
    });

    if (newQueueList) {
      setQueue(newQueueList.filter(s => s.id !== song.id));
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!currentSong && songs.length > 0) {
      playSong(songs[0]);
      return;
    }
    if (isPlaying) {
      audio.pause();
    } else {
      setupWebAudio();
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      audio.play().catch(e => console.error(e));
    }
  };

  const seekTo = (seconds) => {
    const audio = audioRef.current;
    if (audio && !isNaN(seconds)) {
      audio.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  const setVolumeLevel = (level) => {
    const val = Math.max(0, Math.min(1, level));
    setVolume(val);
    setIsMuted(val === 0);
    audioRef.current.volume = val;
    localStorage.setItem('spotify_volume', val.toString());
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioRef.current.volume = volume > 0 ? volume : 0.8;
    } else {
      setIsMuted(true);
      audioRef.current.volume = 0;
    }
  };

  const changePlaybackRate = (rate) => {
    setPlaybackRate(rate);
    audioRef.current.playbackRate = rate;
  };

  const playNext = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue(queue.slice(1));
      playSong(nextSong);
      return;
    }

    // Next from current list
    const currentList = getActiveSongList();
    if (currentList.length === 0) return;

    if (isShuffle) {
      const remaining = currentList.filter(s => s.id !== currentSong?.id);
      if (remaining.length > 0) {
        const randomSong = remaining[Math.floor(Math.random() * remaining.length)];
        playSong(randomSong);
      }
      return;
    }

    const currentIndex = currentList.findIndex(s => s.id === currentSong?.id);
    if (currentIndex >= 0 && currentIndex < currentList.length - 1) {
      playSong(currentList[currentIndex + 1]);
    } else if (repeatMode === 'all') {
      playSong(currentList[0]);
    }
  };

  const playPrevious = () => {
    const audio = audioRef.current;
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (history.length > 0) {
      const prevSong = history[0];
      setHistory(history.slice(1));
      playSong(prevSong);
      return;
    }

    const currentList = getActiveSongList();
    const currentIndex = currentList.findIndex(s => s.id === currentSong?.id);
    if (currentIndex > 0) {
      playSong(currentList[currentIndex - 1]);
    } else {
      audio.currentTime = 0;
    }
  };

  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNext();
    }
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const val = !prev;
      localStorage.setItem('spotify_shuffle', val ? 'true' : 'false');
      return val;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      localStorage.setItem('spotify_repeat', next);
      return next;
    });
  };

  // Favorites
  const toggleFavorite = async (songId) => {
    try {
      const res = await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId })
      }).then(r => r.json());

      if (res.success) {
        setFavorites(res.favorites);
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  const isFavorite = (songId) => favorites.includes(songId);

  // Playlists
  const createPlaylist = async (name, description) => {
    try {
      const res = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      }).then(r => r.json());

      if (res.success) {
        setPlaylists(res.playlists);
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 }
        });
        return res.playlist;
      }
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
    return null;
  };

  const toggleSongInPlaylist = async (playlistId, songId) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}/toggle-song`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId })
      }).then(r => r.json());

      if (res.success) {
        setPlaylists(prev => prev.map(p => p.id === playlistId ? res.playlist : p));
      }
    } catch (err) {
      console.error('Failed to toggle song in playlist:', err);
    }
  };

  const deletePlaylist = async (playlistId) => {
    try {
      const res = await fetch(`/api/playlists/${playlistId}`, {
        method: 'DELETE'
      }).then(r => r.json());

      if (res.success) {
        setPlaylists(res.playlists);
        if (selectedPlaylistId === playlistId) {
          setActiveTab('home');
          setSelectedPlaylistId(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete playlist:', err);
    }
  };

  // Upload handler
  const uploadSongs = async (fileList) => {
    const formData = new FormData();
    for (let i = 0; i < fileList.length; i++) {
      formData.append('songs', fileList[i]);
    }

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    }).then(r => r.json());

    if (res.success) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      await fetchLibrary();
      if (res.songs && res.songs.length > 0) {
        playSong(res.songs[0]);
      }
      return res;
    } else {
      throw new Error(res.error || 'Upload failed');
    }
  };

  // Delete song
  const deleteSong = async (songId) => {
    try {
      const res = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE'
      }).then(r => r.json());

      if (res.success) {
        if (currentSong?.id === songId) {
          playNext();
        }
        await fetchLibrary();
      }
    } catch (err) {
      console.error('Delete song error:', err);
    }
  };

  // Queue helpers
  const addToQueue = (song) => {
    setQueue(prev => [...prev, song]);
  };

  const removeFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  // Active song list resolution
  const getActiveSongList = () => {
    let list = songs;
    if (activeTab === 'liked') {
      list = songs.filter(s => favorites.includes(s.id));
    } else if (activeTab === 'playlist' && selectedPlaylistId) {
      const pl = playlists.find(p => p.id === selectedPlaylistId);
      if (pl) {
        list = songs.filter(s => pl.songs.includes(s.id));
      }
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'devotional') {
        list = list.filter(s => /ram|shambhu|shiv|mahakal|ambe|gange|krushna|bhajan|somnath/i.test(s.title + s.artist + s.album));
      } else if (selectedCategory === 'punjabi') {
        list = list.filter(s => /parmish|desi|punjab|munde|shine|diljit|ap/i.test(s.title + s.artist + s.album));
      } else if (selectedCategory === 'gujarati') {
        list = list.filter(s => /radha|kaan|dwarika|lobadiyaliyu|mahahetvali|dhun|ramo/i.test(s.title + s.artist + s.album));
      } else if (selectedCategory === 'bollywood') {
        list = list.filter(s => /arijit|shivaay|brahmastra|kesariya|chahun|khuda|raabta|baarish/i.test(s.title + s.artist + s.album));
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.title.toLowerCase().includes(q) || 
        s.artist.toLowerCase().includes(q) || 
        s.album.toLowerCase().includes(q)
      );
    }

    return list;
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        seekTo(Math.min(duration, currentTime + 5));
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        seekTo(Math.max(0, currentTime - 5));
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolumeLevel(Math.min(1, volume + 0.05));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolumeLevel(Math.max(0, volume - 0.05));
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      } else if (e.key === 'l' || e.key === 'L') {
        if (currentSong) toggleFavorite(currentSong.id);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentSong, currentTime, duration, volume, isMuted]);

  return (
    <MusicContext.Provider
      value={{
        songs,
        loading,
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackRate,
        isShuffle,
        repeatMode,
        favorites,
        playlists,
        queue,
        history,
        stats,
        activeTab,
        selectedPlaylistId,
        searchQuery,
        selectedCategory,
        rightPanelTab,
        isUploadModalOpen,
        isCreatePlaylistOpen,
        isEqualizerOpen,
        isFullscreen,
        eqPreset,
        eqGains,
        audioRef,
        analyserRef,
        setActiveTab,
        setSelectedPlaylistId,
        setSearchQuery,
        setSelectedCategory,
        setRightPanelTab,
        setIsUploadModalOpen,
        setIsCreatePlaylistOpen,
        setIsEqualizerOpen,
        setIsFullscreen,
        playSong,
        togglePlay,
        seekTo,
        setVolumeLevel,
        toggleMute,
        changePlaybackRate,
        playNext,
        playPrevious,
        toggleShuffle,
        toggleRepeat,
        toggleFavorite,
        isFavorite,
        createPlaylist,
        toggleSongInPlaylist,
        deletePlaylist,
        uploadSongs,
        deleteSong,
        addToQueue,
        removeFromQueue,
        clearQueue,
        getActiveSongList,
        applyEqPreset,
        refreshLibrary: fetchLibrary
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) throw new Error('useMusic must be used within MusicProvider');
  return context;
}


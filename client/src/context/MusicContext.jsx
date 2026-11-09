import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { 
  getUploadedSongs, 
  saveUploadedSong, 
  deleteUploadedSongFromDB 
} from '../utils/browserStorage';

const MusicContext = createContext(null);

// Fisher-Yates array shuffler
const shuffleArray = (array) => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export function MusicProvider({ children }) {
  const { currentUser, updateUserProfile } = useAuth();
  const userKey = currentUser 
    ? (currentUser.id || (currentUser.phone ? currentUser.phone.replace(/\D/g, '') : null) || currentUser.email) 
    : 'guest';

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

  // User-scoped favorites and playlists
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  // Queue: Tracks explicitly queued by the user via "Add to Queue"
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [playbackList, setPlaybackList] = useState([]);

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

  // Synchronous State Refs for bulletproof event handling without stale closures
  const currentSongRef = useRef(null);
  const songsRef = useRef([]);
  const playbackListRef = useRef([]);
  const userQueueRef = useRef([]);
  const isShuffleRef = useRef(isShuffle);
  const repeatModeRef = useRef(repeatMode);
  const historyRef = useRef([]);
  const shuffledQueueRef = useRef([]);

  // Sync state changes to refs
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { songsRef.current = songs; }, [songs]);
  useEffect(() => { playbackListRef.current = playbackList; }, [playbackList]);
  useEffect(() => { userQueueRef.current = queue; }, [queue]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { historyRef.current = history; }, [history]);

  // Sync Volume & Mute to Audio Element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Synchronize favorites and playlists per user profile
  useEffect(() => {
    if (!currentUser) return;

    // 1. Favorites for this user
    let userFavs = currentUser.favorites;
    if (!Array.isArray(userFavs)) {
      const saved = localStorage.getItem(`spotify_favorites_${userKey}`);
      if (saved) {
        try { userFavs = JSON.parse(saved); } catch {}
      }
    }
    // Migration fallback
    if (!Array.isArray(userFavs)) {
      const oldSaved = localStorage.getItem('spotify_favorites');
      if (oldSaved) {
        try { userFavs = JSON.parse(oldSaved); } catch {}
      }
    }
    const finalFavs = Array.isArray(userFavs) ? userFavs : [];
    setFavorites(finalFavs);
    localStorage.setItem(`spotify_favorites_${userKey}`, JSON.stringify(finalFavs));

    // 2. Playlists for this user
    let userPls = currentUser.playlists;
    if (!Array.isArray(userPls) || userPls.length === 0) {
      const saved = localStorage.getItem(`spotify_playlists_${userKey}`);
      if (saved) {
        try { userPls = JSON.parse(saved); } catch {}
      }
    }
    // Migration fallback
    if (!Array.isArray(userPls) || userPls.length === 0) {
      const oldPl = localStorage.getItem('spotify_playlists');
      if (oldPl) {
        try { userPls = JSON.parse(oldPl); } catch {}
      }
    }
    if (!Array.isArray(userPls) || userPls.length === 0) {
      userPls = [
        {
          id: `pl-${userKey}-favs`,
          name: `${currentUser.name ? currentUser.name + "'s Playlist" : 'My Playlist'}`,
          description: 'Personal favorite tracks and playlist',
          songs: [],
          createdAt: new Date().toISOString()
        }
      ];
    }
    setPlaylists(userPls);
    localStorage.setItem(`spotify_playlists_${userKey}`, JSON.stringify(userPls));
  }, [currentUser?.id, currentUser?.phone, currentUser?.email]);

  // Fetch initial songs & stats
  const fetchLibrary = async () => {
    try {
      setLoading(true);
      let fetchedSongs = [];
      let fetchedStats = null;

      // 1. Try backend server API
      try {
        const [sRes, stRes] = await Promise.all([
          fetch('/api/songs').then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/stats').then(r => r.ok ? r.json() : null).catch(() => null),
        ]);
        if (sRes && sRes.success && sRes.songs?.length > 0) fetchedSongs = sRes.songs;
        if (stRes && stRes.success) fetchedStats = stRes.stats;
      } catch (e) {
        console.warn('API fetch warning:', e);
      }

      // 2. Fallback to static manifest if on Vercel
      if (fetchedSongs.length === 0) {
        try {
          const staticRes = await fetch('/data/songs.json').then(r => r.json());
          if (staticRes && staticRes.songs) {
            fetchedSongs = staticRes.songs;
          }
        } catch (e) {
          console.error('Failed to load static songs fallback:', e);
        }
      }

      // 3. Load uploaded songs stored in browser IndexedDB
      const browserSongs = await getUploadedSongs();
      const combined = [...browserSongs, ...fetchedSongs];
      setSongs(combined);
      songsRef.current = combined;

      if (playbackListRef.current.length === 0) {
        setPlaybackList(combined);
        playbackListRef.current = combined;
      }

      // Stats calculation
      const totalDur = combined.reduce((acc, s) => acc + (s.duration || 0), 0);
      const totalSz = combined.reduce((acc, s) => acc + (s.size || 0), 0);
      const artists = new Set(combined.map(s => s.artist));
      setStats(fetchedStats || {
        totalSongs: combined.length,
        totalDuration: totalDur,
        totalSize: totalSz,
        totalArtists: artists.size,
        totalPlaylists: playlists.length,
        totalFavorites: favorites.length
      });

      if (!currentSongRef.current && combined.length > 0) {
        const savedSongId = localStorage.getItem('spotify_last_song');
        const found = combined.find(s => s.id === savedSongId) || combined[0];
        setCurrentSong(found);
        currentSongRef.current = found;
        audioRef.current.src = found.audioUrl;
      }
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  // Web Audio Context setup for visualizer & equalizer
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

  // Audio Playback Controls
  const playSong = async (song, contextList = null) => {
    if (!song) return;
    setupWebAudio();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (currentSongRef.current && currentSongRef.current.id !== song.id) {
      const updatedHistory = [currentSongRef.current, ...historyRef.current.slice(0, 30)];
      setHistory(updatedHistory);
      historyRef.current = updatedHistory;
    }

    setCurrentSong(song);
    currentSongRef.current = song;
    localStorage.setItem('spotify_last_song', song.id);

    // Update active playback context list
    if (contextList && Array.isArray(contextList) && contextList.length > 0) {
      setPlaybackList(contextList);
      playbackListRef.current = contextList;
    } else if (playbackListRef.current.length === 0) {
      const active = getActiveSongList();
      const fallbackList = active.length > 0 ? active : songsRef.current;
      setPlaybackList(fallbackList);
      playbackListRef.current = fallbackList;
    }

    // When shuffle is ON, regenerate shuffle queue for the remaining tracks in this context
    if (isShuffleRef.current) {
      const currentList = playbackListRef.current.length > 0 ? playbackListRef.current : songsRef.current;
      const remaining = currentList.filter(s => s.id !== song.id);
      shuffledQueueRef.current = shuffleArray(remaining);
    }

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

  // Next Track: supports natural song completion (manual=false) and user click (manual=true/event)
  const playNext = (manual = false) => {
    // 1. Repeat ONE check:
    // When song completes naturally (manual === false), loop this track
    if (repeatModeRef.current === 'one' && manual === false) {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(e => console.warn(e));
      }
      return;
    }

    // 2. User Explicit Queue: tracks manually added via "Add to Queue"
    if (userQueueRef.current && userQueueRef.current.length > 0) {
      const nextSong = userQueueRef.current[0];
      const nextQ = userQueueRef.current.slice(1);
      setQueue(nextQ);
      userQueueRef.current = nextQ;
      playSong(nextSong);
      return;
    }

    // 3. Resolve active song list
    let currentList = playbackListRef.current;
    if (!currentList || currentList.length === 0) {
      const active = getActiveSongList();
      currentList = active.length > 0 ? active : songsRef.current;
    }
    if (!currentList || currentList.length === 0) return;

    // 4. SHUFFLE MODE: Play next random song without repeats
    if (isShuffleRef.current) {
      if (!shuffledQueueRef.current || shuffledQueueRef.current.length === 0) {
        const pool = currentList.filter(s => s.id !== currentSongRef.current?.id);
        shuffledQueueRef.current = shuffleArray(pool.length > 0 ? pool : currentList);
      }

      if (shuffledQueueRef.current && shuffledQueueRef.current.length > 0) {
        const nextSong = shuffledQueueRef.current.shift();
        playSong(nextSong);
        return;
      }
    }

    // 5. SEQUENTIAL MODE (Shuffle OFF):
    const currentId = currentSongRef.current?.id;
    const currentIndex = currentList.findIndex(s => s.id === currentId);

    if (currentIndex >= 0 && currentIndex < currentList.length - 1) {
      // Play next song in sequential order
      playSong(currentList[currentIndex + 1]);
    } else if (currentIndex === currentList.length - 1) {
      // Reached the end of playlist
      if (repeatModeRef.current !== 'off' || manual !== false) {
        // Loop back to first song in the playlist
        playSong(currentList[0]);
      } else {
        // Natural completion with repeat off -> stop playback
        setIsPlaying(false);
      }
    } else {
      // Current track not in current list (view changed)
      playSong(currentList[0]);
    }
  };

  const playPrevious = () => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }

    if (historyRef.current && historyRef.current.length > 0) {
      const prevSong = historyRef.current[0];
      const nextH = historyRef.current.slice(1);
      setHistory(nextH);
      historyRef.current = nextH;
      playSong(prevSong);
      return;
    }

    let currentList = playbackListRef.current;
    if (!currentList || currentList.length === 0) {
      const active = getActiveSongList();
      currentList = active.length > 0 ? active : songsRef.current;
    }
    if (!currentList || currentList.length === 0) {
      if (audio) audio.currentTime = 0;
      return;
    }

    const currentId = currentSongRef.current?.id;
    const currentIndex = currentList.findIndex(s => s.id === currentId);
    if (currentIndex > 0) {
      playSong(currentList[currentIndex - 1]);
    } else {
      playSong(currentList[currentList.length - 1]);
    }
  };

  const handleSongEnd = () => {
    // Song completed naturally: advance cleanly to next or loop per repeat mode
    playNext(false);
  };

  const toggleShuffle = () => {
    setIsShuffle(prev => {
      const next = !prev;
      isShuffleRef.current = next;
      localStorage.setItem('spotify_shuffle', next ? 'true' : 'false');

      if (next) {
        let currentList = playbackListRef.current;
        if (!currentList || currentList.length === 0) {
          const active = getActiveSongList();
          currentList = active.length > 0 ? active : songsRef.current;
        }
        const remaining = (currentList || []).filter(s => s.id !== currentSongRef.current?.id);
        shuffledQueueRef.current = shuffleArray(remaining);
      } else {
        shuffledQueueRef.current = [];
      }
      return next;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode(prev => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      repeatModeRef.current = next;
      localStorage.setItem('spotify_repeat', next);
      return next;
    });
  };

  // HTMLAudioElement event listeners bound once with ref-driven event handlers
  useEffect(() => {
    const audio = audioRef.current;

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
  }, []);

  // Favorites (Scoped to User Profile & Synced to Cloud)
  const toggleFavorite = async (songId) => {
    let nextFavs;
    if (favorites.includes(songId)) {
      nextFavs = favorites.filter(id => id !== songId);
    } else {
      nextFavs = [...favorites, songId];
    }
    setFavorites(nextFavs);
    localStorage.setItem(`spotify_favorites_${userKey}`, JSON.stringify(nextFavs));

    if (currentUser) {
      updateUserProfile({ favorites: nextFavs });
    }

    try {
      await fetch('/api/favorites/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, userKey })
      });
    } catch (err) {}
  };

  const isFavorite = (songId) => favorites.includes(songId);

  // Playlists (Scoped to User Profile & Synced to Cloud)
  const createPlaylist = async (name, description) => {
    const newPlaylist = {
      id: 'pl-' + Date.now(),
      name: name.trim(),
      description: description ? description.trim() : 'Created with Fedora Spotify',
      songs: [],
      createdAt: new Date().toISOString()
    };
    const nextPls = [newPlaylist, ...playlists];
    setPlaylists(nextPls);
    localStorage.setItem(`spotify_playlists_${userKey}`, JSON.stringify(nextPls));

    if (currentUser) {
      updateUserProfile({ playlists: nextPls });
    }

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });

    try {
      fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, userKey })
      });
    } catch (err) {}

    return newPlaylist;
  };

  const toggleSongInPlaylist = async (playlistId, songId) => {
    const nextPls = playlists.map(p => {
      if (p.id !== playlistId) return p;
      const inPl = p.songs.includes(songId);
      return {
        ...p,
        songs: inPl ? p.songs.filter(id => id !== songId) : [...p.songs, songId]
      };
    });
    setPlaylists(nextPls);
    localStorage.setItem(`spotify_playlists_${userKey}`, JSON.stringify(nextPls));

    if (currentUser) {
      updateUserProfile({ playlists: nextPls });
    }

    try {
      fetch(`/api/playlists/${playlistId}/toggle-song`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, userKey })
      });
    } catch (err) {}
  };

  const deletePlaylist = async (playlistId) => {
    const nextPls = playlists.filter(p => p.id !== playlistId);
    setPlaylists(nextPls);
    localStorage.setItem(`spotify_playlists_${userKey}`, JSON.stringify(nextPls));

    if (currentUser) {
      updateUserProfile({ playlists: nextPls });
    }

    if (selectedPlaylistId === playlistId) {
      setActiveTab('home');
      setSelectedPlaylistId(null);
    }

    try {
      fetch(`/api/playlists/${playlistId}`, { method: 'DELETE' });
    } catch (err) {}
  };

  // Upload handler with server + IndexedDB storage
  const uploadSongs = async (fileList) => {
    let uploadedSongsList = [];

    // 1. Try server API upload if available
    try {
      const formData = new FormData();
      for (let i = 0; i < fileList.length; i++) {
        formData.append('songs', fileList[i]);
      }
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.songs) {
          uploadedSongsList = data.songs;
        }
      }
    } catch (err) {
      console.warn('Backend upload not reachable, saving to browser IndexedDB...');
    }

    // 2. If server upload not reachable (e.g. on Vercel), store in browser IndexedDB
    if (uploadedSongsList.length === 0) {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const id = 'up_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        const cleanTitle = file.name
          .replace(/\.[^/.]+$/, '')
          .replace(/_spotdown\.org/gi, '')
          .replace(/_/g, ' ')
          .trim();

        const duration = await new Promise((resolve) => {
          const tempAudio = new Audio();
          tempAudio.src = URL.createObjectURL(file);
          tempAudio.onloadedmetadata = () => resolve(Math.round(tempAudio.duration) || 180);
          tempAudio.onerror = () => resolve(180);
        });

        const songData = {
          id,
          filename: file.name,
          title: cleanTitle,
          artist: currentUser?.name || 'User Upload',
          album: 'Downloaded Songs',
          duration,
          size: file.size,
          bitrate: 320,
          genre: 'User Music',
          coverUrl: '/covers/default.svg',
          isUploaded: true
        };

        await saveUploadedSong(songData, file);
        uploadedSongsList.push({
          ...songData,
          audioUrl: URL.createObjectURL(file)
        });
      }
    }

    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });

    await fetchLibrary();
    if (uploadedSongsList.length > 0) {
      playSong(uploadedSongsList[0]);
    }
    return { success: true, songs: uploadedSongsList };
  };

  // Delete song
  const deleteSong = async (songId) => {
    try {
      if (songId.startsWith('up_')) {
        await deleteUploadedSongFromDB(songId);
      } else {
        await fetch(`/api/songs/${songId}`, { method: 'DELETE' });
      }
      if (currentSong?.id === songId) {
        playNext(true);
      }
      await fetchLibrary();
    } catch (err) {
      console.error('Delete song error:', err);
    }
  };

  // Queue helpers for explicitly added songs
  const addToQueue = (song) => {
    const updated = [...queue, song];
    setQueue(updated);
    userQueueRef.current = updated;
  };

  const removeFromQueue = (index) => {
    const updated = queue.filter((_, i) => i !== index);
    setQueue(updated);
    userQueueRef.current = updated;
  };

  const clearQueue = () => {
    setQueue([]);
    userQueueRef.current = [];
  };

  // Active song list resolution based on filters / navigation
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
        if (currentSongRef.current) toggleFavorite(currentSongRef.current.id);
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, currentTime, volume]);

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

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as mm from 'music-metadata';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Directories
const ROOT_DIR = path.resolve(__dirname, '..');
const SONGS_DIR = path.join(ROOT_DIR, 'Songs');
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(SONGS_DIR)) {
  fs.mkdirSync(SONGS_DIR, { recursive: true });
}

// Storage files
const CACHE_FILE = path.join(DATA_DIR, 'cache.json');
const PLAYLISTS_FILE = path.join(DATA_DIR, 'playlists.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');

app.use(cors());
app.use(express.json());

// Helper: Read/Write JSON files safely
function readJson(filePath, defaultValue) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
  }
  return defaultValue;
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err.message);
  }
}

// In-memory cache for fast response
let metadataCache = readJson(CACHE_FILE, {});
let playlists = readJson(PLAYLISTS_FILE, [
  {
    id: 'default-favorites',
    name: 'Top Hits',
    description: 'Fresh favorites and chart toppers',
    songs: [],
    createdAt: new Date().toISOString()
  }
]);
let favorites = readJson(FAVORITES_FILE, []);

// Generate a deterministic ID for a filename
function getSongId(filename) {
  return crypto.createHash('md5').update(filename).digest('hex').substring(0, 16);
}

// Clean messy downloaded titles
function cleanSongName(raw) {
  let name = raw.replace(/\.[^/.]+$/, ''); // remove extension
  name = name.replace(/_spotdown\.org/gi, '');
  name = name.replace(/_pagalworld/gi, '');
  name = name.replace(/- MobCup\.Com\.Co/gi, '');
  name = name.replace(/\[.*?\]|\(.*?\)/g, (match) => {
    if (/feat|remix|acoustic|lofi|flip/i.test(match)) return match;
    return '';
  });
  name = name.replace(/_/g, ' ').trim();
  name = name.replace(/\s+/g, ' ');
  return name || 'Unknown Track';
}

// Parse song metadata
async function parseSongMetadata(filename) {
  const filePath = path.join(SONGS_DIR, filename);
  if (!fs.existsSync(filePath)) return null;

  const stat = fs.statSync(filePath);
  const id = getSongId(filename);

  // Check cache validity by mtime and size
  const cached = metadataCache[id];
  if (cached && cached.mtime === stat.mtimeMs && cached.size === stat.size) {
    return cached;
  }

  let title = cleanSongName(filename);
  let artist = 'Various Artists';
  let album = 'Single';
  let duration = 0;
  let genre = 'Music';
  let year = null;
  let bitrate = 0;
  let hasCover = false;
  let pictureFormat = null;

  try {
    const metadata = await mm.parseFile(filePath, { skipCovers: false });
    if (metadata.common.title) title = metadata.common.title;
    if (metadata.common.artist) artist = metadata.common.artist;
    if (metadata.common.album) album = metadata.common.album;
    if (metadata.format.duration) duration = Math.round(metadata.format.duration);
    if (metadata.common.genre && metadata.common.genre.length > 0) genre = metadata.common.genre.join(', ');
    if (metadata.common.year) year = metadata.common.year;
    if (metadata.format.bitrate) bitrate = Math.round(metadata.format.bitrate / 1000);

    if (metadata.common.picture && metadata.common.picture.length > 0) {
      hasCover = true;
      pictureFormat = metadata.common.picture[0].format;
    }
  } catch (err) {
    console.warn(`Could not parse full metadata for ${filename}:`, err.message);
  }

  const songData = {
    id,
    filename,
    title,
    artist,
    album,
    duration,
    genre,
    year,
    bitrate,
    hasCover,
    pictureFormat,
    size: stat.size,
    mtime: stat.mtimeMs,
    createdAt: stat.birthtime || stat.mtime,
    audioUrl: `/api/songs/${id}/stream`,
    coverUrl: `/api/songs/${id}/cover`
  };

  metadataCache[id] = songData;
  return songData;
}

// Scan and refresh all songs
async function refreshAllSongs() {
  if (!fs.existsSync(SONGS_DIR)) return [];
  const files = fs.readdirSync(SONGS_DIR).filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'].includes(ext);
  });

  const songs = [];
  let cacheModified = false;

  for (const file of files) {
    try {
      const song = await parseSongMetadata(file);
      if (song) songs.push(song);
      cacheModified = true;
    } catch (err) {
      console.error(`Failed reading ${file}:`, err);
    }
  }

  // Remove deleted files from cache
  const existingIds = new Set(songs.map(s => s.id));
  for (const id in metadataCache) {
    if (!existingIds.has(id)) {
      delete metadataCache[id];
      cacheModified = true;
    }
  }

  if (cacheModified) {
    writeJson(CACHE_FILE, metadataCache);
  }

  return songs;
}

// Configure Multer for Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, SONGS_DIR);
  },
  filename: (req, file, cb) => {
    // Preserve clean original name or sanitize
    let safeName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    safeName = safeName.replace(/[\\/:*?"<>|]/g, '_');
    
    // Check if duplicate, append timestamp
    const targetPath = path.join(SONGS_DIR, safeName);
    if (fs.existsSync(targetPath)) {
      const ext = path.extname(safeName);
      const base = path.basename(safeName, ext);
      safeName = `${base}_${Date.now()}${ext}`;
    }
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const allowed = /\.(mp3|wav|ogg|m4a|flac|aac)$/i;
    if (file.originalname.match(allowed)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files (.mp3, .wav, .m4a, .flac, .ogg, .aac) are allowed!'));
    }
  }
});

// ================= API ROUTES =================

// 1. Get all songs
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await refreshAllSongs();
    res.json({
      success: true,
      count: songs.length,
      songs
    });
  } catch (err) {
    console.error('Error fetching songs:', err);
    res.status(500).json({ success: false, error: 'Failed to retrieve songs' });
  }
});

// 2. Stream Audio with HTTP 206 Range support
app.get('/api/songs/:id/stream', (req, res) => {
  const { id } = req.params;
  const song = metadataCache[id];
  if (!song) {
    return res.status(404).json({ error: 'Song not found' });
  }

  const filePath = path.join(SONGS_DIR, song.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Audio file missing on disk' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(song.filename).toLowerCase();
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.m4a': 'audio/mp4',
    '.flac': 'audio/flac',
    '.aac': 'audio/aac'
  };
  const contentType = mimeTypes[ext] || 'audio/mpeg';

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// 3. Get Song Album Cover
app.get('/api/songs/:id/cover', async (req, res) => {
  const { id } = req.params;
  const song = metadataCache[id];
  if (!song) {
    return res.redirect(getGradientSvgUrl('Music'));
  }

  const filePath = path.join(SONGS_DIR, song.filename);
  if (!fs.existsSync(filePath)) {
    return res.redirect(getGradientSvgUrl(song.title));
  }

  try {
    const metadata = await mm.parseFile(filePath, { skipCovers: false });
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const pic = metadata.common.picture[0];
      res.setHeader('Content-Type', pic.format || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(pic.data);
    }
  } catch (err) {
    // Fall back to SVG
  }

  // Fallback: Return nice dynamic SVG placeholder
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(generateCoverSvg(song.title, song.artist));
});

// Helper SVG Generator
function generateCoverSvg(title, artist) {
  const hash = crypto.createHash('md5').update(title + (artist || '')).digest('hex');
  const c1 = `#${hash.substring(0, 6)}`;
  const c2 = `#${hash.substring(6, 12)}`;
  const initial = (title || 'S').trim().charAt(0).toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${c1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${c2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="300" height="300" rx="16" fill="url(#grad)" />
    <circle cx="150" cy="150" r="70" fill="rgba(0,0,0,0.25)" />
    <text x="150" y="172" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle">${initial}</text>
  </svg>`;
}

function getGradientSvgUrl(text) {
  return `/api/default-cover?text=${encodeURIComponent(text || 'Music')}`;
}

app.get('/api/default-cover', (req, res) => {
  const text = req.query.text || 'Music';
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.send(generateCoverSvg(text, 'Spotify'));
});

// 4. Upload Songs Endpoint (Multiple files support)
app.post('/api/upload', upload.array('songs', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: 'No audio files received' });
    }

    const newSongs = [];
    for (const file of req.files) {
      const parsed = await parseSongMetadata(file.filename);
      if (parsed) newSongs.push(parsed);
    }

    writeJson(CACHE_FILE, metadataCache);

    res.json({
      success: true,
      message: `Successfully uploaded ${newSongs.length} song(s)!`,
      songs: newSongs
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message || 'File upload failed' });
  }
});

// 5. Delete Song Endpoint
app.delete('/api/songs/:id', (req, res) => {
  const { id } = req.params;
  const song = metadataCache[id];
  if (!song) {
    return res.status(404).json({ success: false, error: 'Song not found' });
  }

  const filePath = path.join(SONGS_DIR, song.filename);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    delete metadataCache[id];
    writeJson(CACHE_FILE, metadataCache);

    // Remove from playlists and favorites
    favorites = favorites.filter(favId => favId !== id);
    writeJson(FAVORITES_FILE, favorites);

    playlists = playlists.map(p => ({
      ...p,
      songs: p.songs.filter(sId => sId !== id)
    }));
    writeJson(PLAYLISTS_FILE, playlists);

    res.json({ success: true, message: 'Song deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete song' });
  }
});

// 6. Favorites Routes
app.get('/api/favorites', (req, res) => {
  res.json({ success: true, favorites });
});

app.post('/api/favorites/toggle', (req, res) => {
  const { songId } = req.body;
  if (!songId) return res.status(400).json({ error: 'songId required' });

  const idx = favorites.indexOf(songId);
  let isFavorite = false;
  if (idx >= 0) {
    favorites.splice(idx, 1);
    isFavorite = false;
  } else {
    favorites.push(songId);
    isFavorite = true;
  }
  writeJson(FAVORITES_FILE, favorites);
  res.json({ success: true, isFavorite, favorites });
});

// 7. Playlist Management Routes
app.get('/api/playlists', (req, res) => {
  res.json({ success: true, playlists });
});

app.post('/api/playlists', (req, res) => {
  const { name, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Playlist name required' });
  }

  const newPlaylist = {
    id: 'pl-' + Date.now(),
    name: name.trim(),
    description: description ? description.trim() : 'Created with Fedora Spotify',
    songs: [],
    createdAt: new Date().toISOString()
  };

  playlists.unshift(newPlaylist);
  writeJson(PLAYLISTS_FILE, playlists);
  res.json({ success: true, playlist: newPlaylist, playlists });
});

app.put('/api/playlists/:id/toggle-song', (req, res) => {
  const { id } = req.params;
  const { songId } = req.body;
  const playlist = playlists.find(p => p.id === id);
  if (!playlist) return res.status(404).json({ error: 'Playlist not found' });

  const idx = playlist.songs.indexOf(songId);
  let added = false;
  if (idx >= 0) {
    playlist.songs.splice(idx, 1);
  } else {
    playlist.songs.push(songId);
    added = true;
  }

  writeJson(PLAYLISTS_FILE, playlists);
  res.json({ success: true, added, playlist });
});

app.delete('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  playlists = playlists.filter(p => p.id !== id);
  writeJson(PLAYLISTS_FILE, playlists);
  res.json({ success: true, playlists });
});

// 8. Stats / Library Insights
app.get('/api/stats', async (req, res) => {
  const songs = Object.values(metadataCache);
  const totalDuration = songs.reduce((sum, s) => sum + (s.duration || 0), 0);
  const totalSize = songs.reduce((sum, s) => sum + (s.size || 0), 0);
  const uniqueArtists = new Set(songs.map(s => s.artist).filter(Boolean));

  res.json({
    success: true,
    stats: {
      totalSongs: songs.length,
      totalDuration,
      totalSize,
      totalArtists: uniqueArtists.size,
      totalPlaylists: playlists.length,
      totalFavorites: favorites.length
    }
  });
});

// Serve Vite React build if available
const DIST_DIR = path.join(ROOT_DIR, 'client', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/stream')) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Start Server
app.listen(PORT, async () => {
  console.log(`🎵 Fedora Spotify Music Server is running on http://localhost:${PORT}`);
  console.log(`📂 Scanning Songs folder at ${SONGS_DIR}...`);
  const initialSongs = await refreshAllSongs();
  console.log(`✅ Loaded ${initialSongs.length} songs ready to stream!`);
});

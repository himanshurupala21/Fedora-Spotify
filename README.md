# 🎵 Fedora Spotify Web Music Player

A modern, high-fidelity Spotify-inspired music player built with **React.js, Tailwind CSS, Lucide Icons, Node.js/Express, and Web Audio API**.

---

## ✨ Features

- 🎧 **Automatic Library Detection**: Scans and plays all 52+ MP3 files from the `Songs` folder.
- 🖼️ **Native ID3 Album Art & Metadata**: Extracts real track titles, artists, albums, durations, bitrates, and embedded cover art directly from MP3 files.
- 🚀 **Drag-and-Drop Audio Uploads**: Upload new songs (`.mp3`, `.wav`, `.m4a`, `.flac`, `.ogg`) via modal dropzone; files are automatically saved to the `Songs` folder and instantly appear in the library for everyone.
- ⚡ **HTTP 206 Partial Range Streaming**: Instant seeking and scrubbing with zero playback lag.
- 📊 **Real-time Web Audio Visualizer**: Live 60 FPS spectrum analyzer reacting dynamically to the playing song.
- 🎚️ **Equalizer & Sound FX**: Built-in audio presets (Bass Boost, Vocal & Acoustic, Electronic, Rock, Flat) powered by Web Audio Biquad filters.
- 📝 **Interactive Lyrics View**: Synced track details and lyrics display.
- 🔁 **Spotify Playback Engine**: Shuffle, Repeat (Off, All, One), Queue management, playback speed (0.75x to 2x), and volume control with mute.
- ❤️ **Liked Songs & Custom Playlists**: Save favorites and create custom playlists with persistent storage.
- 🖥️ **Fullscreen Immersive Player**: Large album art, animated background glow, and full controls.
- ⌨️ **Keyboard Shortcuts**:
  - `Space`: Play / Pause
  - `←` / `→`: Seek backward / forward 5 seconds
  - `↑` / `↓`: Volume up / down 5%
  - `M`: Mute / Unmute
  - `L`: Like / Unlike current track
  - `F`: Toggle Fullscreen Mode

---

## 🚀 Quick Start

### 1. Run the App
```bash
# Start both Backend Server and Frontend:
npm run dev
```

Or run the production server (already pre-built):
```bash
npm start
```

Open your browser at:
- **Production Player**: [http://localhost:5000](http://localhost:5000)
- **Vite Dev Server**: [http://localhost:5173](http://localhost:5173)

---

## 📂 Project Structure

```
├── Songs/               # Audio library folder (contains MP3s)
├── server/
│   ├── server.js        # Express API, streaming engine, upload handler & ID3 parser
│   └── data/            # Cache, playlists, and favorites storage
├── client/              # React + Vite + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/  # Sidebar, Player, MainView, RightPanel, UploadModal, etc.
│   │   ├── context/     # Global MusicContext & Web Audio pipeline
│   │   └── utils/       # Formatters & helpers
```


import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as mm from 'music-metadata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
const SONGS_DIR = path.join(ROOT_DIR, 'Songs');
const COVERS_DIR = path.join(ROOT_DIR, 'client', 'public', 'covers');
const DATA_DIR = path.join(ROOT_DIR, 'client', 'public', 'data');
const CACHE_FILE = path.join(ROOT_DIR, 'server', 'data', 'cache.json');

if (!fs.existsSync(COVERS_DIR)) fs.mkdirSync(COVERS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

async function run() {
  const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  const staticSongs = [];

  for (const id in cache) {
    const s = cache[id];
    const filePath = path.join(SONGS_DIR, s.filename);
    let coverUrl = `/covers/${id}.jpg`;

    if (fs.existsSync(filePath)) {
      try {
        const meta = await mm.parseFile(filePath);
        if (meta.common.picture && meta.common.picture.length > 0) {
          const pic = meta.common.picture[0];
          const ext = (pic.format || '').includes('png') ? 'png' : 'jpg';
          const coverFilename = `${id}.${ext}`;
          fs.writeFileSync(path.join(COVERS_DIR, coverFilename), pic.data);
          coverUrl = `/covers/${coverFilename}`;
        }
      } catch (err) {
        console.warn(`Could not extract cover for ${s.filename}`);
      }
    }

    const githubAudioUrl = `https://raw.githubusercontent.com/himanshurupala21/Fedora-Spotify/main/Songs/${encodeURIComponent(s.filename)}`;

    staticSongs.push({
      ...s,
      coverUrl,
      audioUrl: githubAudioUrl,
      localAudioUrl: s.audioUrl
    });
  }

  const manifest = {
    success: true,
    count: staticSongs.length,
    songs: staticSongs
  };

  fs.writeFileSync(path.join(DATA_DIR, 'songs.json'), JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`✅ Successfully generated static data for ${staticSongs.length} songs with covers into client/public!`);
}

run();

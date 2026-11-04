// IndexedDB helper for storing uploaded songs in the browser
const DB_NAME = 'fedora_spotify_db';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_songs';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUploadedSong(songData, fileBlob) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const record = {
      ...songData,
      blob: fileBlob,
      uploadedAt: Date.now()
    };
    store.put(record);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(record);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.error('Error saving to IndexedDB:', err);
    return null;
  }
}

export async function getUploadedSongs() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const records = request.result || [];
        const formatted = records.map(r => {
          let audioUrl = r.audioUrl;
          if (r.blob) {
            audioUrl = URL.createObjectURL(r.blob);
          }
          return {
            ...r,
            audioUrl,
            isUploaded: true
          };
        });
        resolve(formatted);
      };
      request.onerror = () => resolve([]);
    });
  } catch (err) {
    console.error('Error reading from IndexedDB:', err);
    return [];
  }
}

export async function deleteUploadedSongFromDB(id) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.error('Error deleting from IndexedDB:', err);
  }
}


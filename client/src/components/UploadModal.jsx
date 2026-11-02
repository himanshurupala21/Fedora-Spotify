import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileAudio, 
  CheckCircle2, 
  AlertCircle, 
  Music, 
  Sparkles,
  ArrowUpCircle
} from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { formatFileSize } from '../utils/formatters';

export default function UploadModal() {
  const { isUploadModalOpen, setIsUploadModalOpen, uploadSongs } = useMusic();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const fileInputRef = useRef(null);

  if (!isUploadModalOpen) return null;

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter(f => 
      /\.(mp3|wav|ogg|m4a|flac|aac)$/i.test(f.name)
    );
    if (validFiles.length === 0) {
      setErrorMessage('Please select valid audio files (.mp3, .wav, .m4a, .flac, .ogg, .aac)');
      return;
    }
    setErrorMessage(null);
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(20);
    setStatusMessage('Transferring songs to Fedora Music Songs folder...');

    try {
      // Simulate stepped progress
      const progressTimer = setInterval(() => {
        setUploadProgress(p => (p < 85 ? p + 15 : p));
      }, 200);

      const res = await uploadSongs(selectedFiles);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setStatusMessage(`Successfully imported ${selectedFiles.length} song(s)! Ready to play.`);

      setTimeout(() => {
        setIsUploading(false);
        setSelectedFiles([]);
        setStatusMessage(null);
        setIsUploadModalOpen(false);
      }, 1500);
    } catch (err) {
      setIsUploading(false);
      setErrorMessage(err.message || 'Failed to upload songs. Please try again.');
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setIsUploadModalOpen(false);
    setSelectedFiles([]);
    setErrorMessage(null);
    setStatusMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-xl bg-[#181818] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 flex items-center justify-center text-[#1db954]">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Upload Downloaded Songs</h2>
              <p className="text-xs text-zinc-400">Save songs directly to Songs folder for everyone to enjoy</p>
            </div>
          </div>

          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#1db954] bg-[#1db954]/10 scale-[1.01]'
              : 'border-zinc-700 hover:border-zinc-500 bg-[#242424]/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
            }}
          />

          <div className="w-14 h-14 rounded-full bg-[#1db954]/10 flex items-center justify-center text-[#1db954] mb-3">
            <ArrowUpCircle className="w-8 h-8 animate-bounce" />
          </div>

          <h3 className="font-bold text-base text-white mb-1">
            Drag and drop your audio files here
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mb-4">
            Supports MP3, WAV, FLAC, M4A, OGG. High bitrate audio is automatically parsed and ID3 covers are preserved.
          </p>

          <button
            type="button"
            className="bg-white hover:bg-zinc-200 text-black px-5 py-2 rounded-full font-bold text-xs shadow-md transition-transform hover:scale-105 pointer-events-none"
          >
            Choose Audio Files
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg flex items-center gap-2.5 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className="bg-[#1db954]/10 border border-[#1db954]/30 p-3 rounded-lg flex items-center gap-2.5 text-xs text-[#1db954]">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-zinc-400">
              <span>Uploading & Parsing ID3 Metadata...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-[#1db954] transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Selected Files List */}
        {selectedFiles.length > 0 && !isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>{selectedFiles.length} file(s) ready</span>
              <span>
                Total: {formatFileSize(selectedFiles.reduce((acc, f) => acc + f.size, 0))}
              </span>
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {selectedFiles.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="bg-[#242424] px-3 py-2 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Music className="w-4 h-4 text-[#1db954] flex-shrink-0" />
                    <span className="truncate font-medium">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 text-[11px] whitespace-nowrap">
                      {formatFileSize(file.size)}
                    </span>
                    <button
                      onClick={() => handleRemoveFile(i)}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                      title="Remove"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            onClick={handleStartUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="bg-[#1db954] hover:bg-[#1ed760] disabled:bg-zinc-700 disabled:text-zinc-500 text-black px-6 py-2 rounded-full font-bold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Importing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Import to Library</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


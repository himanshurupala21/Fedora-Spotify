import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Heart, 
  ListMusic, 
  LogOut, 
  Sparkles, 
  Check, 
  Edit2, 
  Headphones,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';

export default function ProfileModal({ isOpen, onClose }) {
  const { currentUser, updateUserProfile, logout, isAdmin } = useAuth();
  const { favorites = [], playlists = [] } = useMusic();

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(currentUser?.name || '');
  const [editedPhone, setEditedPhone] = useState(currentUser?.phone || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editedName.trim()) return;

    updateUserProfile({
      name: editedName.trim(),
      phone: editedPhone.trim()
    });

    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const formattedDate = currentUser.approvedAt 
    ? new Date(currentUser.approvedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Active Member';

  const userInitial = (currentUser.name || 'F').charAt(0).toUpperCase();

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-[#181818] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-5 text-white animate-in zoom-in-95 duration-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-[#1db954]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between relative z-10 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1db954]/20 flex items-center justify-center text-[#1db954]">
              <User className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-wide text-zinc-200">User Profile</span>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Center */}
        <div className="flex flex-col items-center text-center relative z-10 space-y-3 pt-1">
          {/* Avatar Icon */}
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 text-black flex items-center justify-center font-black text-3xl shadow-xl shadow-green-500/20 ring-4 ring-white/10">
              {userInitial}
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#1db954] text-black border-2 border-[#181818] flex items-center justify-center shadow">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          {/* User Name & Role */}
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
              <span>{currentUser.name}</span>
              {!isEditing && (
                <button
                  onClick={() => {
                    setEditedName(currentUser.name);
                    setEditedPhone(currentUser.phone || '');
                    setIsEditing(true);
                  }}
                  className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                  title="Edit Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </h2>

            <div className="flex items-center justify-center gap-2">
              {isAdmin || currentUser.role === 'owner' ? (
                <span className="inline-flex items-center gap-1 bg-[#1db954]/20 border border-[#1db954]/30 text-[#1db954] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin / Owner</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-[#1db954]/15 border border-[#1db954]/25 text-[#1db954] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm">
                  <Award className="w-3 h-3" />
                  <span>Verified Member</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1 bg-white/5 text-zinc-400 text-[10px] font-medium px-2 py-0.5 rounded-full">
                <Calendar className="w-2.5 h-2.5" />
                <span>Since {formattedDate}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Success message */}
        {savedSuccess && (
          <div className="bg-[#1db954]/15 border border-[#1db954]/30 text-[#1db954] text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Profile details updated successfully!</span>
          </div>
        )}

        {/* Edit Form or Details View */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-3 bg-[#242424] p-3.5 rounded-2xl border border-white/5 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Your Name</label>
              <input 
                type="text"
                required
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full bg-[#181818] text-white px-3 py-2 rounded-xl outline-none border border-white/10 focus:border-[#1db954]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 font-semibold">Phone Number</label>
              <input 
                type="tel"
                value={editedPhone}
                onChange={(e) => setEditedPhone(e.target.value)}
                placeholder="+91 ..."
                className="w-full bg-[#181818] text-white px-3 py-2 rounded-xl outline-none border border-white/10 focus:border-[#1db954]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 bg-[#1db954] hover:bg-[#1ed760] text-black font-bold py-2 rounded-xl transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-white/10 hover:bg-white/15 text-zinc-300 font-semibold py-2 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Profile Details Cards */
          <div className="space-y-2.5 text-xs relative z-10">
            {/* Contact Details Card */}
            <div className="bg-[#242424]/80 p-3 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-zinc-300">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Mail className="w-3.5 h-3.5 text-[#1db954]" />
                  <span>Email</span>
                </div>
                <span className="font-medium text-white truncate max-w-[200px]">{currentUser.email || 'None'}</span>
              </div>

              {currentUser.phone && (
                <div className="flex items-center justify-between text-zinc-300 border-t border-white/5 pt-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Phone className="w-3.5 h-3.5 text-[#1db954]" />
                    <span>Phone Number</span>
                  </div>
                  <span className="font-medium text-white font-mono">{currentUser.phone}</span>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#242424]/80 p-2.5 rounded-2xl border border-white/5 text-center">
                <Heart className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                <span className="font-bold text-sm text-white block">{favorites.length}</span>
                <span className="text-[10px] text-zinc-400">Liked Songs</span>
              </div>

              <div className="bg-[#242424]/80 p-2.5 rounded-2xl border border-white/5 text-center">
                <ListMusic className="w-4 h-4 text-[#1db954] mx-auto mb-1" />
                <span className="font-bold text-sm text-white block">{playlists.length}</span>
                <span className="text-[10px] text-zinc-400">Playlists</span>
              </div>

              <div className="bg-[#242424]/80 p-2.5 rounded-2xl border border-white/5 text-center">
                <Headphones className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <span className="font-bold text-sm text-white block">Hi-Fi</span>
                <span className="text-[10px] text-zinc-400">Streaming</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 relative z-10">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Lock / Switch Profile</span>
          </button>

          <button
            onClick={onClose}
            className="bg-white hover:bg-zinc-200 text-black px-5 py-2 rounded-full font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

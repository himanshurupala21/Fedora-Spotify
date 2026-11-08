import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Users, 
  Check, 
  Ban, 
  Copy, 
  Key, 
  Mail, 
  Phone, 
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminManagerModal({ isOpen, onClose }) {
  const { allRequests, adminApproveUser, adminRevokeUser } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const inviteLink = `${window.location.origin}/?grant=vip`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="w-full max-w-2xl bg-[#181818] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-white animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#1db954]/20 border border-[#1db954]/40 flex items-center justify-center text-[#1db954]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-white">Access Requests & Admin</h2>
              <p className="text-xs text-zinc-400">Manage user access requests & permissions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Master Codes & Quick Invite Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Master Code */}
          <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
              <Key className="w-3.5 h-3.5 text-[#1db954]" />
              <span>Master Passcode</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-white text-sm bg-black/40 px-2 py-0.5 rounded border border-white/5">
                FEDORA21
              </span>
              <span className="text-[11px] text-zinc-400">Works for any user</span>
            </div>
          </div>

          {/* Quick VIP Link */}
          <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Instant VIP Invite Link</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={handleCopyInvite}
                className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black py-1 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Link!' : 'Copy Direct Link'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Requests List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
          <div className="flex items-center justify-between text-xs text-zinc-400 px-1 py-1">
            <span>User Requests ({allRequests.length})</span>
            <span>Status / Actions</span>
          </div>

          {allRequests.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-xs space-y-2">
              <Users className="w-8 h-8 mx-auto text-zinc-600" />
              <p>No access requests yet. Share the app link to start receiving requests!</p>
            </div>
          ) : (
            allRequests.map((req, idx) => (
              <div
                key={req.email + idx}
                className="bg-[#242424] p-3 rounded-xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm truncate">{req.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      req.status === 'approved' 
                        ? 'bg-[#1db954]/20 text-[#1db954]' 
                        : req.status === 'revoked'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-zinc-400 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span>{req.email}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span>{req.phone}</span>
                    </span>
                  </div>
                  <div className="text-[10px] text-zinc-500 flex items-center gap-2 pt-0.5">
                    <span>Code: <b className="text-[#1db954] font-mono">{req.code}</b></span>
                    <span>•</span>
                    <span>Requested: {req.requestedAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  {req.status !== 'approved' ? (
                    <button
                      onClick={() => adminApproveUser(req.email)}
                      className="bg-[#1db954] hover:bg-[#1ed760] text-black px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => adminRevokeUser(req.email)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full font-semibold text-xs flex items-center gap-1 transition-colors border border-red-500/20"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Revoke</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-white/5">
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

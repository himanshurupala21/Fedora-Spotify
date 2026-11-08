import React, { useState } from 'react';
import { 
  Disc3, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  KeyRound, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthGate() {
  const { 
    requestAccess, 
    verifyAccessCode, 
    adminLogin, 
    pendingRequest, 
    ownerEmail 
  } = useAuth();

  // Mode: 'form' | 'pending' | 'enter_code' | 'admin'
  const [mode, setMode] = useState(() => {
    return pendingRequest ? 'pending' : 'form';
  });

  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Code verification field
  const [accessCode, setAccessCode] = useState('');
  
  // Admin PIN field
  const [adminPin, setAdminPin] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Request Access Submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!name.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Please fill in all fields (Name, Phone number, and Email).');
      return;
    }

    // Basic email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestAccess({ name, phone, email });
      if (res.success) {
        setSuccessMessage('Access request sent successfully to the admin!');
        setTimeout(() => {
          setMode('pending');
          setSuccessMessage('');
        }, 1000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Entering Access Code
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!accessCode.trim()) {
      setErrorMessage('Please enter your 6-digit access code.');
      return;
    }

    const valid = verifyAccessCode(accessCode.trim());
    if (!valid) {
      setErrorMessage('Invalid access code. Please check the code provided by the admin or try the master passcode.');
    }
  };

  // Handle Admin Login
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminPin.trim()) {
      setErrorMessage('Please enter your admin PIN.');
      return;
    }

    const success = adminLogin(adminPin.trim());
    if (!success) {
      setErrorMessage('Incorrect PIN. Please enter the correct admin PIN.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col justify-between items-center p-4 relative overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#1db954]/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-700/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Header Logo */}
      <div className="relative z-10 flex items-center gap-2.5 mt-4 sm:mt-8">
        <div className="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg shadow-green-500/30">
          <Disc3 className="w-6 h-6 animate-spin-slow" />
        </div>
        <span className="font-black text-xl sm:text-2xl tracking-tight text-white">
          Fedora<span className="text-[#1db954]">Spotify</span>
        </span>
      </div>

      {/* Central Glass Card */}
      <div className="relative z-10 w-full max-w-md my-auto py-6">
        <div className="bg-[#181818]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">

          {/* ================= 1. REQUEST ACCESS FORM ================= */}
          {mode === 'form' && (
            <>
              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 bg-[#1db954]/10 border border-[#1db954]/25 text-[#1db954] px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase mb-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Private Access Only</span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white">Request Access</h1>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Submit your details below to request access from the owner.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl flex items-center gap-2.5 text-xs text-red-300">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="bg-[#1db954]/10 border border-[#1db954]/30 p-3 rounded-xl flex items-center gap-2.5 text-xs text-[#1db954]">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              <form onSubmit={handleRequestSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#1db954] transition-colors" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-[#1db954] transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#1db954] transition-colors" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-[#1db954] transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#1db954] transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. yourname@example.com"
                      className="w-full bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-[#1db954] transition-all"
                    />
                  </div>
                </div>

                {/* Notice text */}
                <p className="text-[11px] text-zinc-400 text-center pt-1">
                  Requests are sent directly to <span className="text-white font-medium">{ownerEmail}</span>
                </p>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-zinc-700 disabled:text-zinc-500 text-black py-3 rounded-full font-bold text-sm shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Sending Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Access Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switch Links */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5 text-center text-xs text-zinc-400">
                <button
                  onClick={() => { setMode('enter_code'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors"
                >
                  Already have an Access Code? <span className="text-[#1db954] font-semibold underline">Enter Code</span>
                </button>
                <button
                  onClick={() => { setMode('admin'); setErrorMessage(''); }}
                  className="hover:text-zinc-300 transition-colors text-[11px]"
                >
                  Owner / Admin Login
                </button>
              </div>
            </>
          )}

          {/* ================= 2. PENDING APPROVAL STATE ================= */}
          {mode === 'pending' && pendingRequest && (
            <>
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <Clock className="w-7 h-7 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-white">Access Request Pending</h2>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Your request has been delivered to <span className="text-white font-semibold">{ownerEmail}</span>.
                </p>
              </div>

              {/* User details summary card */}
              <div className="bg-[#242424] p-3.5 rounded-xl border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Name</span>
                  <span className="text-white font-medium">{pendingRequest.name}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Phone</span>
                  <span className="text-white font-medium">{pendingRequest.phone}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Email</span>
                  <span className="text-white font-medium">{pendingRequest.email}</span>
                </div>
                <div className="flex justify-between text-zinc-400 border-t border-white/5 pt-1.5">
                  <span>Your Request ID</span>
                  <span className="text-[#1db954] font-mono font-bold">{pendingRequest.code}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              {/* Access Code Input */}
              <form onSubmit={handleCodeSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">
                    Received Approval Code from Owner?
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#1db954]" />
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter 6-digit Code (e.g. FED-1234)"
                      className="w-full bg-[#242424] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-[#1db954] font-mono tracking-wider uppercase"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black py-2.5 rounded-full font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Player with Code</span>
                </button>
              </form>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                <button
                  onClick={() => { setMode('form'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors"
                >
                  ← Edit Request
                </button>
                <button
                  onClick={() => { setMode('admin'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors"
                >
                  Admin Login
                </button>
              </div>
            </>
          )}

          {/* ================= 3. ENTER ACCESS CODE DIRECTLY ================= */}
          {mode === 'enter_code' && (
            <>
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-[#1db954]/10 border border-[#1db954]/30 flex items-center justify-center text-[#1db954] mx-auto mb-1">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white">Enter Access Code</h2>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Enter the access pass code granted by the admin to unlock the music player.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Approval Code / Passcode</label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="e.g. FED-1234 or Passcode"
                    className="w-full bg-[#242424] text-white text-base rounded-xl px-4 py-3 outline-none border border-transparent focus:border-[#1db954] font-mono tracking-widest text-center uppercase"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black py-3 rounded-full font-bold text-sm shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                  Unlock Fedora Spotify
                </button>
              </form>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-zinc-400">
                <button
                  onClick={() => { setMode('form'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Request Access</span>
                </button>
                <button
                  onClick={() => { setMode('admin'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors"
                >
                  Admin Login
                </button>
              </div>
            </>
          )}

          {/* ================= 4. OWNER / ADMIN LOGIN ================= */}
          {mode === 'admin' && (
            <>
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#1db954] mx-auto mb-1">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white">Owner Sign-in</h2>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Welcome Himanshu. Enter your admin PIN to access Fedora Spotify and approve users.
                </p>
              </div>

              {errorMessage && (
                <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl text-xs text-red-300">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Admin Security PIN</label>
                  <input
                    type="password"
                    autoFocus
                    required
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter Admin PIN"
                    className="w-full bg-[#242424] text-white text-center text-lg rounded-xl px-4 py-2.5 outline-none border border-transparent focus:border-[#1db954] tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#1db954] hover:bg-[#1ed760] text-black py-3 rounded-full font-bold text-sm shadow-lg shadow-green-500/20 active:scale-95 transition-all"
                >
                  Sign In as Owner
                </button>
              </form>

              <div className="text-center pt-2 border-t border-white/5 text-xs text-zinc-400">
                <button
                  onClick={() => { setMode('form'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors flex items-center gap-1 mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to User Request</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Footer copyright */}
      <footer className="relative z-10 text-[11px] text-zinc-400 text-center py-2">
        Fedora Spotify Private Player • Protected by Access Verification
      </footer>
    </div>
  );
}

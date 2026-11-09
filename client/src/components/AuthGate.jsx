import React, { useState, useEffect } from 'react';
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
  LogIn, 
  UserPlus, 
  ChevronLeft,
  Download,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import InstallAppModal from './InstallAppModal';

export default function AuthGate() {
  const { 
    requestAccess, 
    loginWithProfile, 
    verifyAccessCode, 
    adminLogin, 
    pendingRequest,
    userProfiles = []
  } = useAuth();

  // PWA & App Install prompt state
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  // Mode: 'login' | 'form' | 'pending' | 'enter_code' | 'admin'
  const [mode, setMode] = useState(() => {
    if (pendingRequest) return 'pending';
    return userProfiles.length > 0 ? 'login' : 'form';
  });

  // Login form fields (Name + Phone or Email)
  const [loginName, setLoginName] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');

  // Request Access Form fields
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

  // Handle User Profile Login (Name + Phone or Email)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginName.trim() || !loginIdentifier.trim()) {
      setErrorMessage('Please enter both your Name and registered Phone or Email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithProfile({
        name: loginName,
        identifier: loginIdentifier
      });

      if (!res.success) {
        setErrorMessage(res.error || 'No approved profile found matching these credentials.');
      } else {
        setSuccessMessage(`Welcome back, ${res.profile?.name || loginName}! Unlocking player...`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Request Access Submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
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
        }, 800);
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
      setErrorMessage('Please enter your approval code.');
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

      {/* Top Header Logo & Download App Action */}
      <div className="relative z-10 flex flex-col items-center gap-2.5 mt-3 sm:mt-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#1db954] flex items-center justify-center text-black shadow-lg shadow-green-500/30">
            <Disc3 className="w-6 h-6 animate-spin-slow" />
          </div>
          <span className="font-black text-xl sm:text-2xl tracking-tight text-white">
            Fedora<span className="text-[#1db954]">Spotify</span>
          </span>
        </div>

        {/* Download App Pill Button for Mobile & PC */}
        <button
          onClick={() => setIsInstallModalOpen(true)}
          className="flex items-center gap-2 bg-[#1db954]/15 hover:bg-[#1ed760]/25 border border-[#1db954]/40 hover:border-[#1db954] text-[#1db954] hover:text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md shadow-green-500/10 backdrop-blur-md transition-all active:scale-95 group cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform stroke-[2.5]" />
          <span>Download App for Mobile / PC</span>
          <span className="bg-[#1db954] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
            Free
          </span>
        </button>
      </div>

      {/* Central Glass Card */}
      <div className="relative z-10 w-full max-w-md my-auto py-6">
        <div className="bg-[#181818]/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5">

          {/* Top Segmented Tab Switcher (Visible in Login & Form modes) */}
          {(mode === 'login' || mode === 'form') && (
            <div className="flex bg-[#242424] p-1 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'login' 
                    ? 'bg-[#1db954] text-black shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => { setMode('form'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'form' 
                    ? 'bg-[#1db954] text-black shadow-md' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Request Access</span>
              </button>
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/25 p-3 rounded-xl flex items-center gap-2.5 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="bg-[#1db954]/10 border border-[#1db954]/30 p-3 rounded-xl flex items-center gap-2.5 text-xs text-[#1db954] animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ================= 1. USER PROFILE LOGIN (Name + Phone or Email) ================= */}
          {mode === 'login' && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-white">Welcome Back</h1>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Sign in with your Name and registered Phone Number or Email.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Your Name</label>
                  <div className="relative group">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#1db954] transition-colors" />
                    <input
                      type="text"
                      required
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-[#1db954] transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number or Email */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Phone Number or Email</label>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#1db954] transition-colors" />
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. +91 9876543210 or email@domain.com"
                      className="w-full bg-[#242424] hover:bg-[#282828] focus:bg-[#282828] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none border border-transparent focus:border-[#1db954] transition-all"
                    />
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1db954] hover:bg-[#1ed760] disabled:bg-zinc-700 disabled:text-zinc-500 text-black py-3 rounded-full font-bold text-sm shadow-lg shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Download App Mini-Banner */}
              <div 
                onClick={() => setIsInstallModalOpen(true)}
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#242424] to-[#1a1a1a] border border-[#1db954]/25 hover:border-[#1db954]/60 cursor-pointer transition-all group active:scale-[0.98] shadow my-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1db954] flex items-center justify-center text-black shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Download className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white group-hover:text-[#1db954] transition-colors">
                        Download Fedora Spotify
                      </span>
                      <span className="bg-[#1db954]/20 text-[#1db954] text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                        All Devices
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Install on Android, iPhone, Windows or Mac
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#1db954] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>

              {/* Bottom Switch Links */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5 text-center text-xs text-zinc-400">
                <button
                  onClick={() => { setMode('enter_code'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors"
                >
                  Received an Approval Code? <span className="text-[#1db954] font-semibold underline">Enter Code</span>
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

          {/* ================= 2. REQUEST ACCESS FORM (New Users) ================= */}
          {mode === 'form' && (
            <>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black tracking-tight text-white">Request Access</h1>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Submit your details below to request an account and create your profile.
                </p>
              </div>

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
                  Requests are sent directly to the Admin for approval
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

              {/* Download App Mini-Banner */}
              <div 
                onClick={() => setIsInstallModalOpen(true)}
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#242424] to-[#1a1a1a] border border-[#1db954]/25 hover:border-[#1db954]/60 cursor-pointer transition-all group active:scale-[0.98] shadow my-1"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1db954] flex items-center justify-center text-black shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Download className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white group-hover:text-[#1db954] transition-colors">
                        Download Fedora Spotify
                      </span>
                      <span className="bg-[#1db954]/20 text-[#1db954] text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                        All Devices
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      Install on Android, iPhone, Windows or Mac
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-[#1db954] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </div>

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

          {/* ================= 3. PENDING APPROVAL STATE ================= */}
          {mode === 'pending' && pendingRequest && (
            <>
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                  <Clock className="w-7 h-7 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-white">Access Request Pending</h2>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Your request has been delivered to the Admin for approval.
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
                  <span>Status</span>
                  <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 animate-spin-slow" /> Pending Approval
                  </span>
                </div>
              </div>

              {/* Access Code Input */}
              <form onSubmit={handleCodeSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">
                    Received Approval Code from Admin?
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-[#1db954]" />
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter 4-digit Code (e.g. 1234 or FED-1234)"
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
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors"
                >
                  ← Log In to Profile
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

          {/* ================= 4. ENTER ACCESS CODE DIRECTLY ================= */}
          {mode === 'enter_code' && (
            <>
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-[#1db954]/10 border border-[#1db954]/30 flex items-center justify-center text-[#1db954] mx-auto mb-1">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white">Enter Access Code</h2>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Enter the approval code granted by the admin to unlock your profile.
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-400">Approval Code / Passcode</label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="e.g. 1234 or FED-1234"
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
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
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

          {/* ================= 5. OWNER / ADMIN LOGIN ================= */}
          {mode === 'admin' && (
            <>
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-[#1db954] mx-auto mb-1">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white">Owner Sign-in</h2>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Enter your admin security PIN to unlock the master player and permissions dashboard.
                </p>
              </div>

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
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="hover:text-white transition-colors flex items-center gap-1 mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
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

      {/* Download & Install Application Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
      />
    </div>
  );
}

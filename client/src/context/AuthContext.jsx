import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const AuthContext = createContext(null);

const OWNER_EMAIL = 'himanshurupala21@gmail.com';
const ADMIN_PINS = ['2125', 'fedora21', 'himanshu21'];
const MASTER_ACCESS_CODES = ['FEDORA21', 'SPOTIFY2026', 'VIP2026', 'FEDORA-ACCESS'];

export function AuthProvider({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(() => {
    return localStorage.getItem('fedora_auth_approved') === 'true';
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fedora_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userProfiles, setUserProfiles] = useState(() => {
    try {
      const saved = localStorage.getItem('fedora_user_profiles');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pendingRequest, setPendingRequest] = useState(() => {
    try {
      const saved = localStorage.getItem('fedora_pending_request');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [allRequests, setAllRequests] = useState(() => {
    try {
      const saved = localStorage.getItem('fedora_all_requests');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('fedora_is_admin') === 'true';
  });

  // Check URL query parameters for auto-approval (e.g. ?code=... or ?grant=vip)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const codeParam = params.get('code');
    const grantParam = params.get('grant');
    const emailParam = params.get('email');

    if (grantParam === 'vip' || grantParam === 'owner' || grantParam === 'approved') {
      grantFullAccess({
        name: 'VIP Guest',
        email: emailParam || 'guest@fedora.local',
        phone: 'Verified Link',
        approvedAt: new Date().toISOString()
      });
      cleanUrlParams();
    } else if (codeParam) {
      if (verifyAccessCode(codeParam)) {
        cleanUrlParams();
      }
    }
  }, []);

  const cleanUrlParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('code');
    url.searchParams.delete('grant');
    url.searchParams.delete('email');
    window.history.replaceState({}, document.title, url.pathname);
  };

  // Helper: Smart Name, Phone, and Email matchers
  const matchName = (n1, n2) => {
    if (!n1 || !n2) return false;
    const clean1 = n1.toString().trim().toLowerCase().replace(/\s+/g, ' ');
    const clean2 = n2.toString().trim().toLowerCase().replace(/\s+/g, ' ');
    return clean1 === clean2 || clean1.includes(clean2) || clean2.includes(clean1);
  };

  const matchPhone = (p1, p2) => {
    if (!p1 || !p2) return false;
    const d1 = p1.toString().replace(/\D/g, '');
    const d2 = p2.toString().replace(/\D/g, '');
    if (!d1 || !d2) return false;
    if (d1 === d2) return true;
    if (d1.length >= 10 && d2.length >= 10) {
      return d1.slice(-10) === d2.slice(-10);
    }
    return false;
  };

  const matchEmail = (e1, e2) => {
    if (!e1 || !e2) return false;
    return e1.toString().trim().toLowerCase() === e2.toString().trim().toLowerCase();
  };

  const matchIdentifier = (userPhone, userEmail, queryIdentifier) => {
    if (!queryIdentifier) return false;
    return matchPhone(userPhone, queryIdentifier) || matchEmail(userEmail, queryIdentifier);
  };

  // Register / Persist an approved user profile
  const saveUserProfile = (profile) => {
    setUserProfiles(prev => {
      const pEmail = (profile.email || '').toLowerCase().trim();
      const filtered = prev.filter(p => {
        const sameEmail = pEmail && p.email && p.email.toLowerCase().trim() === pEmail;
        const samePhone = matchPhone(p.phone, profile.phone);
        return !(sameEmail || samePhone);
      });
      const updated = [profile, ...filtered];
      localStorage.setItem('fedora_user_profiles', JSON.stringify(updated));
      return updated;
    });

    // Also sync to backend if reachable
    try {
      fetch('/api/profiles/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      }).catch(() => {});
    } catch {}
  };

  const grantFullAccess = (user) => {
    const cleanUser = {
      id: user.id || `usr_${Date.now()}`,
      name: user.name || 'Authorized Member',
      phone: user.phone || '',
      email: user.email || '',
      role: user.role || 'member',
      status: 'approved',
      avatarColor: user.avatarColor || 'from-emerald-500 to-green-400',
      approvedAt: user.approvedAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    setIsAuthorized(true);
    setCurrentUser(cleanUser);
    localStorage.setItem('fedora_auth_approved', 'true');
    localStorage.setItem('fedora_auth_user', JSON.stringify(cleanUser));
    localStorage.removeItem('fedora_pending_request');
    setPendingRequest(null);

    // Save profile to userProfiles registry
    saveUserProfile(cleanUser);

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Log in with Name and Phone Number OR Email
  const loginWithProfile = async ({ name, identifier }) => {
    if (!name || !identifier) {
      return { success: false, error: 'Please enter both your Name and Phone or Email.' };
    }

    // 1. Check local userProfiles
    let found = userProfiles.find(p => {
      return matchName(p.name, name) && matchIdentifier(p.phone, p.email, identifier);
    });

    // 2. If not found locally, try checking server backend
    if (!found) {
      try {
        const res = await fetch('/api/profiles/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, identifier })
        });
        const data = await res.json();
        if (data.success && data.profile) {
          found = data.profile;
        } else if (data.status === 'pending') {
          return {
            success: false,
            status: 'pending',
            error: data.error || 'Your access request is currently pending admin approval.'
          };
        }
      } catch {}
    }

    // 3. If found and approved
    if (found && (found.status === 'approved' || !found.status)) {
      grantFullAccess(found);
      return { success: true, profile: found };
    }

    // 4. Check if in pendingRequest or allRequests
    const isPending = (pendingRequest && (
      matchName(pendingRequest.name, name) && matchIdentifier(pendingRequest.phone, pendingRequest.email, identifier)
    )) || allRequests.some(r => 
      r.status === 'pending' && matchName(r.name, name) && matchIdentifier(r.phone, r.email, identifier)
    );

    if (isPending) {
      return {
        success: false,
        status: 'pending',
        error: `Your request for "${name}" is awaiting admin approval. Once approved, you can log in directly here!`
      };
    }

    return {
      success: false,
      status: 'not_found',
      error: `No approved profile found for "${name}" with this Phone/Email. Click "Request Access" to register.`
    };
  };

  // Update current user profile fields (e.g. name, phone, avatar)
  const updateUserProfile = (updatedFields) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updatedFields };
    setCurrentUser(updated);
    localStorage.setItem('fedora_auth_user', JSON.stringify(updated));
    saveUserProfile(updated);
  };

// Generate clean 4-digit approval code (e.g. FED-7294)
  const generateAccessCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `FED-${num}`;
  };

  // Safe code normalization & hashing so approval codes are never exposed to clients
  const normalizeCode = (val) => {
    if (!val) return '';
    const clean = val.toString().trim().toUpperCase().replace(/[\s-]/g, '');
    return clean.startsWith('FED') ? clean.slice(3) : clean;
  };

  const hashPasscode = (codeStr) => {
    const num = normalizeCode(codeStr);
    if (!num) return '';
    let hash = 0;
    const str = `FEDORA_SECRET_SALT_${num}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `h_${Math.abs(hash).toString(36)}`;
  };

  // Submit request and notify himanshurupala21@gmail.com
  const requestAccess = async ({ name, phone, email }) => {
    const code = generateAccessCode();
    const codeHash = hashPasscode(code);
    const timestamp = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

    // Client stored state - NEVER stores plain approval code!
    const newRequest = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      codeHash,
      requestedAt: timestamp,
      status: 'pending'
    };

    // Save locally for the pending screen
    setPendingRequest(newRequest);
    localStorage.setItem('fedora_pending_request', JSON.stringify(newRequest));

    // Update all requests registry (safely with codeHash)
    setAllRequests(prev => {
      const filtered = prev.filter(r => r.email !== newRequest.email);
      const updated = [newRequest, ...filtered];
      localStorage.setItem('fedora_all_requests', JSON.stringify(updated));
      return updated;
    });

    // Prepare email payload for himanshurupala21@gmail.com (Owner gets the real code!)
    const emailData = {
      name: newRequest.name,
      email: newRequest.email,
      phone: newRequest.phone,
      access_code: code,
      requested_at: timestamp,
      _subject: `🎵 New Fedora Spotify Access Request: ${newRequest.name}`,
      message: `New User Access Request for Fedora Spotify:

Name: ${newRequest.name}
Email: ${newRequest.email}
Phone: ${newRequest.phone}
Approval Code: ${code}
Requested At: ${timestamp}

To grant this user access:
1. Share their unique Approval Code (${code}) with them, OR
2. Give them the Master Passcode (FEDORA21), OR
3. Share this direct approval link:
${window.location.origin}/?code=${code}&email=${encodeURIComponent(newRequest.email)}`
    };

    let sent = false;

    // 1. Try sending via FormSubmit to himanshurupala21@gmail.com
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${OWNER_EMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailData)
      });
      if (res.ok) {
        sent = true;
      }
    } catch (err) {
      console.warn('FormSubmit network note:', err.message);
    }

    // 2. Fallback: Also try local/server API if available
    try {
      await fetch('/api/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
    } catch {}

    return { success: true, request: newRequest };
  };

  // Verify code entered by user or link
  const verifyAccessCode = (inputCode) => {
    if (!inputCode) return false;
    const cleanInput = inputCode.trim().toUpperCase();

    // 1. Check Master Codes
    if (MASTER_ACCESS_CODES.includes(cleanInput)) {
      grantFullAccess({
        name: pendingRequest?.name || 'Authorized User',
        email: pendingRequest?.email || 'user@fedora.local',
        phone: pendingRequest?.phone || '',
        code: cleanInput,
        approvedAt: new Date().toISOString(),
        role: 'member'
      });
      return true;
    }

    // 2. Check User's Pending Request (hashed or plain)
    const inputHash = hashPasscode(cleanInput);
    if (pendingRequest) {
      const matchHash = pendingRequest.codeHash && pendingRequest.codeHash === inputHash;
      const matchPlain = pendingRequest.code && (
        pendingRequest.code.toUpperCase() === cleanInput || 
        cleanInput === pendingRequest.code.replace('FED-', '')
      );

      if (matchHash || matchPlain) {
        grantFullAccess({
          ...pendingRequest,
          status: 'approved',
          approvedAt: new Date().toISOString()
        });
        return true;
      }
    }

    // 3. Check All Registered Requests
    const found = allRequests.find(r => {
      const rHashMatch = r.codeHash && r.codeHash === inputHash;
      const rPlainMatch = r.code && (
        r.code.toUpperCase() === cleanInput || 
        cleanInput === r.code.replace('FED-', '')
      );
      return rHashMatch || rPlainMatch;
    });

    if (found) {
      grantFullAccess({
        ...found,
        status: 'approved',
        approvedAt: new Date().toISOString()
      });
      return true;
    }

    return false;
  };

  // Admin login for Himanshu
  const adminLogin = (pin) => {
    if (ADMIN_PINS.includes(pin.trim())) {
      setIsAdmin(true);
      localStorage.setItem('fedora_is_admin', 'true');
      grantFullAccess({
        name: 'Himanshu Rupala',
        email: OWNER_EMAIL,
        phone: 'Owner',
        role: 'owner',
        approvedAt: new Date().toISOString()
      });
      return true;
    }
    return false;
  };

  // Admin approves a pending user
  const adminApproveUser = (email) => {
    setAllRequests(prev => {
      const updated = prev.map(r => r.email === email ? { ...r, status: 'approved' } : r);
      localStorage.setItem('fedora_all_requests', JSON.stringify(updated));
      return updated;
    });

    if (pendingRequest && pendingRequest.email === email) {
      grantFullAccess({ ...pendingRequest, status: 'approved' });
    }
  };

  // Admin revokes access
  const adminRevokeUser = (email) => {
    setAllRequests(prev => {
      const updated = prev.map(r => r.email === email ? { ...r, status: 'revoked' } : r);
      localStorage.setItem('fedora_all_requests', JSON.stringify(updated));
      return updated;
    });

    if (currentUser && currentUser.email === email) {
      logout();
    }
  };

  // Sign out / Reset session
  const logout = () => {
    setIsAuthorized(false);
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('fedora_auth_approved');
    localStorage.removeItem('fedora_auth_user');
    localStorage.removeItem('fedora_is_admin');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthorized,
        currentUser,
        userProfiles,
        pendingRequest,
        allRequests,
        isAdmin,
        ownerEmail: OWNER_EMAIL,
        requestAccess,
        loginWithProfile,
        updateUserProfile,
        saveUserProfile,
        verifyAccessCode,
        adminLogin,
        adminApproveUser,
        adminRevokeUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

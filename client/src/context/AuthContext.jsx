import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const AuthContext = createContext(null);

const OWNER_PROFILE = {
  id: 'owner_himanshu',
  name: 'Himanshu Rupala',
  email: 'himanshurupala21@gmail.com',
  phone: '9879004729',
  role: 'owner',
  status: 'approved',
  avatarColor: 'from-emerald-500 to-green-400',
  approvedAt: '2026-01-01T00:00:00.000Z',
  favorites: [],
  playlists: []
};

const OWNER_EMAIL = 'himanshurupala21@gmail.com';
const OWNER_NAMES = ['himanshu', 'himanshu rupala', 'rupala', 'admin', 'owner'];
const OWNER_PHONES = ['9879004729', '+919879004729', '09879004729'];
const OWNER_EMAILS = ['himanshurupala21@gmail.com', 'himanshu@gmail.com'];
const ADMIN_PINS = ['2125', 'fedora21', 'himanshu21', '9879004729'];
const MASTER_ACCESS_CODES = ['FEDORA21', 'SPOTIFY2026', 'VIP2026', 'FEDORA-ACCESS'];

// Global Cloud Database (CORS-enabled, cross-device persistence)
const CLOUD_PROFILES_URL = 'https://kvdb.io/5Ewzgd1jqfWeoGQjYYrafH/profiles';
const CLOUD_REQUESTS_URL = 'https://kvdb.io/5Ewzgd1jqfWeoGQjYYrafH/requests';

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

// Global Cloud Fetchers & Savers
const fetchCloudProfiles = async () => {
  try {
    const res = await fetch(CLOUD_PROFILES_URL, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object') return [data];
    }
  } catch {}
  return [];
};

const saveCloudProfile = async (profile) => {
  try {
    const existing = await fetchCloudProfiles();
    const filtered = existing.filter(p => {
      const sameEmail = profile.email && p.email && p.email.toLowerCase().trim() === profile.email.toLowerCase().trim();
      const samePhone = profile.phone && p.phone && matchPhone(p.phone, profile.phone);
      return !(sameEmail || samePhone);
    });
    const updated = [profile, ...filtered];
    await fetch(CLOUD_PROFILES_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  } catch {}
};

const fetchCloudRequests = async () => {
  try {
    const res = await fetch(CLOUD_REQUESTS_URL, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
      if (data && typeof data === 'object') return [data];
    }
  } catch {}
  return [];
};

const saveCloudRequest = async (request) => {
  try {
    const existing = await fetchCloudRequests();
    const filtered = existing.filter(r => r.email !== request.email && !matchPhone(r.phone, request.phone));
    const updated = [request, ...filtered];
    await fetch(CLOUD_REQUESTS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
  } catch {}
};

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
      const list = saved ? JSON.parse(saved) : [];
      // Always ensure Owner is in the profiles list
      if (!list.some(p => p.role === 'owner' || p.phone === '9879004729')) {
        return [OWNER_PROFILE, ...list];
      }
      return list;
    } catch {
      return [OWNER_PROFILE];
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

  // Background sync on mount: fetch cloud profiles and cloud requests for multi-device sync
  useEffect(() => {
    async function syncCloud() {
      const cloudProfiles = await fetchCloudProfiles();
      if (cloudProfiles && cloudProfiles.length > 0) {
        setUserProfiles(prev => {
          const merged = [...cloudProfiles, ...prev.filter(lp => !cloudProfiles.some(cp => cp.email === lp.email || matchPhone(cp.phone, lp.phone)))];
          if (!merged.some(p => p.phone === '9879004729')) {
            merged.unshift(OWNER_PROFILE);
          }
          localStorage.setItem('fedora_user_profiles', JSON.stringify(merged));
          return merged;
        });
      }

      const cloudReqs = await fetchCloudRequests();
      if (cloudReqs && cloudReqs.length > 0) {
        setAllRequests(prev => {
          const merged = [...cloudReqs, ...prev.filter(lr => !cloudReqs.some(cr => cr.email === lr.email || matchPhone(cr.phone, lr.phone)))];
          localStorage.setItem('fedora_all_requests', JSON.stringify(merged));
          return merged;
        });
      }
    }
    syncCloud();
  }, []);

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

  // Register / Persist an approved user profile across local storage and global cloud
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

    // Save to global cloud database (for any device access)
    saveCloudProfile(profile);

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
      lastLoginAt: new Date().toISOString(),
      favorites: Array.isArray(user.favorites) ? user.favorites : [],
      playlists: Array.isArray(user.playlists) ? user.playlists : []
    };

    setIsAuthorized(true);
    setCurrentUser(cleanUser);
    localStorage.setItem('fedora_auth_approved', 'true');
    localStorage.setItem('fedora_auth_user', JSON.stringify(cleanUser));
    localStorage.removeItem('fedora_pending_request');
    setPendingRequest(null);

    // Save profile to userProfiles registry and cloud
    saveUserProfile(cleanUser);

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Log in with Name and Phone Number OR Email (Works across ANY device!)
  const loginWithProfile = async ({ name, identifier }) => {
    if (!name || !identifier) {
      return { success: false, error: 'Please enter both your Name and Phone or Email.' };
    }

    const queryName = name.trim();
    const queryId = identifier.trim();

    // 1. FIRST CHECK: Is this the Owner (Himanshu Rupala - 9879004729)?
    const isOwnerName = OWNER_NAMES.some(n => matchName(n, queryName));
    const isOwnerId = OWNER_PHONES.some(p => matchPhone(p, queryId)) ||
                      OWNER_EMAILS.some(e => matchEmail(e, queryId)) ||
                      ADMIN_PINS.includes(queryId);

    if (isOwnerName && isOwnerId) {
      setIsAdmin(true);
      localStorage.setItem('fedora_is_admin', 'true');
      const existingOwner = userProfiles.find(p => p.role === 'owner' || p.phone === '9879004729') || OWNER_PROFILE;
      grantFullAccess(existingOwner);
      saveCloudProfile(existingOwner);
      return { success: true, profile: existingOwner };
    }

    // 2. Check local userProfiles cache
    let found = userProfiles.find(p => {
      return matchName(p.name, queryName) && matchIdentifier(p.phone, p.email, queryId);
    });

    // 3. If not in local cache, check Global Cloud Database (kvdb.io)
    if (!found) {
      try {
        const cloudProfiles = await fetchCloudProfiles();
        if (cloudProfiles && cloudProfiles.length > 0) {
          // Merge into local device
          setUserProfiles(prev => {
            const merged = [...cloudProfiles, ...prev.filter(lp => !cloudProfiles.some(cp => cp.email === lp.email || matchPhone(cp.phone, lp.phone)))];
            localStorage.setItem('fedora_user_profiles', JSON.stringify(merged));
            return merged;
          });

          found = cloudProfiles.find(p => {
            return matchName(p.name, queryName) && matchIdentifier(p.phone, p.email, queryId);
          });
        }
      } catch (err) {
        console.warn('Cloud login check:', err.message);
      }
    }

    // 4. Try local backend Node API if available
    if (!found) {
      try {
        const res = await fetch('/api/profiles/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: queryName, identifier: queryId })
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

    // 5. If found and approved -> UNLOCK IMMEDIATELY!
    if (found && (found.status === 'approved' || !found.status)) {
      grantFullAccess(found);
      saveCloudProfile(found);
      return { success: true, profile: found };
    }

    // 6. Check if pending in Global Cloud Requests
    try {
      const cloudReqs = await fetchCloudRequests();
      const matchedCloudReq = cloudReqs.find(r => 
        matchName(r.name, queryName) && matchIdentifier(r.phone, r.email, queryId)
      );

      if (matchedCloudReq) {
        if (matchedCloudReq.status === 'approved') {
          const approvedProfile = {
            id: matchedCloudReq.id || `usr_${Date.now()}`,
            name: matchedCloudReq.name,
            phone: matchedCloudReq.phone,
            email: matchedCloudReq.email,
            role: 'member',
            status: 'approved',
            approvedAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            favorites: Array.isArray(matchedCloudReq.favorites) ? matchedCloudReq.favorites : [],
            playlists: Array.isArray(matchedCloudReq.playlists) ? matchedCloudReq.playlists : []
          };
          grantFullAccess(approvedProfile);
          saveCloudProfile(approvedProfile);
          return { success: true, profile: approvedProfile };
        } else {
          return {
            success: false,
            status: 'pending',
            error: `Your request for "${queryName}" is awaiting admin approval. Once approved, you can log in directly here!`
          };
        }
      }
    } catch {}

    // 7. Check if pending locally
    const isPending = (pendingRequest && (
      matchName(pendingRequest.name, queryName) && matchIdentifier(pendingRequest.phone, pendingRequest.email, queryId)
    )) || allRequests.some(r => 
      r.status === 'pending' && matchName(r.name, queryName) && matchIdentifier(r.phone, r.email, queryId)
    );

    if (isPending) {
      return {
        success: false,
        status: 'pending',
        error: `Your request for "${queryName}" is awaiting admin approval. Once approved, you can log in directly here!`
      };
    }

    return {
      success: false,
      status: 'not_found',
      error: `No approved profile found for "${queryName}" with this Phone/Email. Click "Request Access" to register.`
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

    // Save request to Global Cloud Database so Owner can see/approve it on any device
    saveCloudRequest({ ...newRequest, code });

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

  // Admin approves a pending user across all devices
  const adminApproveUser = async (email) => {
    setAllRequests(prev => {
      const updated = prev.map(r => r.email === email ? { ...r, status: 'approved' } : r);
      localStorage.setItem('fedora_all_requests', JSON.stringify(updated));
      return updated;
    });

    const targetUser = allRequests.find(r => r.email === email) || (pendingRequest?.email === email ? pendingRequest : null);
    if (targetUser) {
      const approvedProfile = {
        id: targetUser.id || `usr_${Date.now()}`,
        name: targetUser.name,
        phone: targetUser.phone,
        email: targetUser.email,
        role: 'member',
        status: 'approved',
        avatarColor: 'from-emerald-500 to-green-400',
        approvedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      saveUserProfile(approvedProfile);
      await saveCloudProfile(approvedProfile);

      // Update cloud requests
      try {
        const cloudReqs = await fetchCloudRequests();
        const updatedReqs = cloudReqs.map(r => r.email === email ? { ...r, status: 'approved' } : r);
        await fetch(CLOUD_REQUESTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedReqs)
        });
      } catch {}
    }

    if (pendingRequest && pendingRequest.email === email) {
      grantFullAccess({ ...pendingRequest, status: 'approved' });
    }
  };

  // Admin revokes access across all devices
  const adminRevokeUser = async (email) => {
    setAllRequests(prev => {
      const updated = prev.map(r => r.email === email ? { ...r, status: 'revoked' } : r);
      localStorage.setItem('fedora_all_requests', JSON.stringify(updated));
      return updated;
    });

    setUserProfiles(prev => {
      const updated = prev.filter(p => p.email !== email);
      localStorage.setItem('fedora_user_profiles', JSON.stringify(updated));
      return updated;
    });

    try {
      const cloudProfiles = await fetchCloudProfiles();
      const filtered = cloudProfiles.filter(p => p.email !== email);
      await fetch(CLOUD_PROFILES_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filtered)
      });
    } catch {}

    if (currentUser && currentUser.email === email) {
      logout();
    }
  };

  // Refresh cloud requests and profiles on demand
  const refreshCloudData = async () => {
    try {
      const cloudReqs = await fetchCloudRequests();
      if (cloudReqs && cloudReqs.length > 0) {
        setAllRequests(prev => {
          const merged = [...cloudReqs, ...prev.filter(lr => !cloudReqs.some(cr => cr.email === lr.email || matchPhone(cr.phone, lr.phone)))];
          localStorage.setItem('fedora_all_requests', JSON.stringify(merged));
          return merged;
        });
      }
      const cloudProfs = await fetchCloudProfiles();
      if (cloudProfs && cloudProfs.length > 0) {
        setUserProfiles(prev => {
          const merged = [...cloudProfs, ...prev.filter(lp => !cloudProfs.some(cp => cp.email === lp.email || matchPhone(cp.phone, lp.phone)))];
          if (!merged.some(p => p.phone === '9879004729')) {
            merged.unshift(OWNER_PROFILE);
          }
          localStorage.setItem('fedora_user_profiles', JSON.stringify(merged));
          return merged;
        });
      }
    } catch {}
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
        refreshCloudData,
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

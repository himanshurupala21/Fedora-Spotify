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

  const grantFullAccess = (user) => {
    setIsAuthorized(true);
    setCurrentUser(user);
    localStorage.setItem('fedora_auth_approved', 'true');
    localStorage.setItem('fedora_auth_user', JSON.stringify(user));
    localStorage.removeItem('fedora_pending_request');
    setPendingRequest(null);

    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Generate clean 6-digit approval code (e.g. FED-7294)
  const generateAccessCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    return `FED-${num}`;
  };

  // Submit request and notify himanshurupala21@gmail.com
  const requestAccess = async ({ name, phone, email }) => {
    const code = generateAccessCode();
    const timestamp = new Date().toLocaleString('en-US', { timeZoneName: 'short' });

    const newRequest = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      code,
      requestedAt: timestamp,
      status: 'pending'
    };

    // Save locally
    setPendingRequest(newRequest);
    localStorage.setItem('fedora_pending_request', JSON.stringify(newRequest));

    // Update all requests registry
    setAllRequests(prev => {
      const filtered = prev.filter(r => r.email !== newRequest.email);
      const updated = [newRequest, ...filtered];
      localStorage.setItem('fedora_all_requests', JSON.stringify(updated));
      return updated;
    });

    // Prepare email payload for himanshurupala21@gmail.com
    const emailData = {
      name: newRequest.name,
      email: newRequest.email,
      phone: newRequest.phone,
      access_code: newRequest.code,
      requested_at: timestamp,
      _subject: `🎵 New Fedora Spotify Access Request: ${newRequest.name}`,
      message: `New User Access Request for Fedora Spotify:

Name: ${newRequest.name}
Email: ${newRequest.email}
Phone: ${newRequest.phone}
Generated Access Code: ${newRequest.code}
Requested At: ${timestamp}

To grant this user access:
1. Share their unique Access Code (${newRequest.code}) with them, OR
2. Give them the master code, OR
3. Share this direct approval link:
${window.location.origin}/?code=${newRequest.code}&email=${encodeURIComponent(newRequest.email)}`
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

    // 2. Check User's Pending Request Code
    if (pendingRequest && (pendingRequest.code.toUpperCase() === cleanInput || cleanInput === pendingRequest.code.replace('FED-', ''))) {
      grantFullAccess({
        ...pendingRequest,
        status: 'approved',
        approvedAt: new Date().toISOString()
      });
      return true;
    }

    // 3. Check All Registered Requests
    const found = allRequests.find(r => r.code.toUpperCase() === cleanInput || cleanInput === r.code.replace('FED-', ''));
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
        pendingRequest,
        allRequests,
        isAdmin,
        ownerEmail: OWNER_EMAIL,
        requestAccess,
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

const USER_SESSION_STORAGE_KEY = 'user-session-v1';

export function readUserSession() {
  try {
    const raw = localStorage.getItem(USER_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token || !parsed?.user) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveUserSession(session) {
  localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem('isLoggedIn', '1');
}

export function clearUserSession() {
  localStorage.removeItem(USER_SESSION_STORAGE_KEY);
  localStorage.removeItem('isLoggedIn');
}

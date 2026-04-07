const ADMIN_SESSION_TTL_MS = 10 * 60 * 1000;

const KEY_LOGGED_IN = 'isAdminLoggedIn';
const KEY_USER = 'adminUser';
const KEY_EXPIRES_AT = 'adminSessionExpiresAt';

export function startAdminSession(username) {
  localStorage.setItem(KEY_LOGGED_IN, '1');
  localStorage.setItem(KEY_USER, username);
  localStorage.setItem(KEY_EXPIRES_AT, String(Date.now() + ADMIN_SESSION_TTL_MS));
}

export function clearAdminSession() {
  localStorage.removeItem(KEY_LOGGED_IN);
  localStorage.removeItem(KEY_USER);
  localStorage.removeItem(KEY_EXPIRES_AT);
}

export function isAdminSessionActive() {
  const loggedIn = localStorage.getItem(KEY_LOGGED_IN) === '1';
  const expiresAt = Number(localStorage.getItem(KEY_EXPIRES_AT) || 0);
  if (!loggedIn || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    clearAdminSession();
    return false;
  }
  return true;
}

export function getAdminUser() {
  return localStorage.getItem(KEY_USER) || 'admin';
}

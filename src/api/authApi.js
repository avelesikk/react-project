const AUTH_API_URL = process.env.REACT_APP_AUTH_API_URL || 'http://localhost:4000/api/auth';

function withAuthHeaders(auth) {
  const token = typeof auth === 'string' ? auth : auth?.token || '';
  const user = typeof auth === 'string' ? null : auth?.user || null;
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (user?.id) headers['X-User-Id'] = String(user.id);
  if (user?.email) headers['X-User-Email'] = String(user.email);
  return headers;
}

async function parseResponse(res, fallbackMessage) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || fallbackMessage);
  }
  return data;
}

export async function registerUser(payload) {
  const res = await fetch(`${AUTH_API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(res, 'Не удалось зарегистрироваться.');
}

export async function loginUser(payload) {
  const res = await fetch(`${AUTH_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parseResponse(res, 'Не удалось выполнить вход.');
}

export async function getCurrentUser(auth) {
  const res = await fetch(`${AUTH_API_URL}/me`, {
    headers: withAuthHeaders(auth),
  });
  return parseResponse(res, 'Требуется авторизация.');
}

export async function logoutUser(auth) {
  const res = await fetch(`${AUTH_API_URL}/logout`, {
    method: 'POST',
    headers: withAuthHeaders(auth),
  });
  return parseResponse(res, 'Не удалось выйти из аккаунта.');
}

export async function createUserOrder(auth, payload) {
  const res = await fetch(`${AUTH_API_URL}/orders`, {
    method: 'POST',
    headers: withAuthHeaders(auth),
    body: JSON.stringify(payload),
  });
  return parseResponse(res, 'Не удалось оформить заказ.');
}

export async function getUserOrders(auth) {
  const res = await fetch(`${AUTH_API_URL}/orders`, {
    headers: withAuthHeaders(auth),
  });
  return parseResponse(res, 'Не удалось получить заказы.');
}

export async function cancelUserOrder(auth, orderId) {
  const res = await fetch(`${AUTH_API_URL}/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: withAuthHeaders(auth),
  });
  return parseResponse(res, 'Не удалось отменить заказ.');
}

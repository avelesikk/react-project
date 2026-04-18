const ADMIN_API_URL = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:4000/api/admin';

function withAuthHeaders(auth) {
  const token = typeof auth === 'string' ? auth : auth?.token || '';
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export async function getAdminOrders(auth) {
  const res = await fetch(`${ADMIN_API_URL}/orders`, {
    headers: withAuthHeaders(auth),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Не удалось загрузить заказы.');
  }
  return data;
}

export async function updateAdminOrderStatus(auth, orderId, status) {
  const res = await fetch(`${ADMIN_API_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: withAuthHeaders(auth),
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Не удалось обновить статус заказа.');
  }
  return data;
}

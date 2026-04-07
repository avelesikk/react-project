const ADMIN_API_URL = process.env.REACT_APP_ADMIN_API_URL || 'http://localhost:4000/api/admin';

export async function loginAdmin(payload) {
  const res = await fetch(`${ADMIN_API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Ошибка авторизации.');
  }

  return data;
}

export async function getAdminOrders() {
  const res = await fetch(`${ADMIN_API_URL}/orders`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Не удалось загрузить заказы.');
  }
  return data;
}

export async function updateAdminOrderStatus(orderId, status) {
  const res = await fetch(`${ADMIN_API_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Не удалось обновить статус заказа.');
  }
  return data;
}

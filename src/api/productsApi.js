const PRODUCTS_API_URL = process.env.REACT_APP_PRODUCTS_API_URL || 'http://localhost:4000/api/products';

export async function getProducts() {
  const res = await fetch(PRODUCTS_API_URL);
  if (!res.ok) throw new Error('products_fetch_failed');
  const data = await res.json();
  return Array.isArray(data?.products) ? data.products : [];
}

export async function getProductById(id) {
  const res = await fetch(`${PRODUCTS_API_URL}/${id}`);
  if (!res.ok) throw new Error('product_fetch_failed');
  const data = await res.json();
  return data?.product || null;
}

export async function createProduct(formData) {
  const res = await fetch(PRODUCTS_API_URL, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Не удалось добавить товар.');
  }
  return data?.product || null;
}

export async function updateProduct(id, formData) {
  const res = await fetch(`${PRODUCTS_API_URL}/${id}`, {
    method: 'PUT',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Не удалось обновить товар.');
  }
  return data?.product || null;
}

export async function deleteProduct(id) {
  const res = await fetch(`${PRODUCTS_API_URL}/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || 'Не удалось удалить товар.');
  }
  return data;
}

const API_URL = process.env.REACT_APP_REVIEWS_API_URL || 'http://localhost:4000/api/reviews';

export async function getReviews(productId) {
  const query = Number.isInteger(Number(productId)) ? `?productId=${Number(productId)}` : '';
  const res = await fetch(`${API_URL}${query}`, { method: 'GET' });
  if (!res.ok) throw new Error('reviews_fetch_failed');
  const data = await res.json();
  return Array.isArray(data?.reviews) ? data.reviews : [];
}

export async function createReview(payload) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('review_create_failed');
  const data = await res.json();
  return data?.review;
}

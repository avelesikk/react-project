import { useEffect, useMemo, useState } from 'react';
import { createReview, getReviews } from '../api/reviewsApi';
import './ReviewsSection.css';

const RATING_OPTIONS = [5, 4, 3, 2, 1];

function renderStars(count) {
  return '★'.repeat(count) + '☆'.repeat(5 - count);
}

export default function ReviewsSection({ productId, title = 'Отзывы наших клиентов' }) {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [form, setForm] = useState({
    author_name: '',
    rating: 5,
    review_text: '',
  });

  useEffect(() => {
    let active = true;
    localStorage.removeItem('city-k-reviews-local');

    getReviews(productId)
      .then((items) => {
        if (!active) return;
        setReviews(items);
      })
      .catch(() => {
        if (!active) return;
        setErrorMessage('Не удалось загрузить отзывы. Проверьте, запущен ли backend.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [productId]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 5;
    const sum = reviews.reduce((acc, item) => acc + Number(item.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.review_text.trim()) return;

    setIsSending(true);
    setErrorMessage('');
    try {
      await createReview({
        product_id: Number(productId),
        author_name: form.author_name.trim(),
        rating: Number(form.rating),
        review_text: form.review_text.trim(),
      });
      const freshList = await getReviews(productId);
      setReviews(freshList);
      setForm({ author_name: '', rating: 5, review_text: '' });
    } catch {
      setErrorMessage('Не удалось отправить отзыв. Проверьте подключение к серверу и БД.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section className="reviews-section">
      <div className="container reviews-section__container">
        <h2 className="reviews-section__title">{title}</h2>
        <form className="review-form" onSubmit={onSubmit}>
          <h2>Оставить отзыв</h2>
          <label htmlFor="review-name">Имя</label>
          <input
            id="review-name"
            value={form.author_name}
            onChange={(e) => setForm((prev) => ({ ...prev, author_name: e.target.value }))}
            placeholder="Ваше имя"
            required
          />

          <label htmlFor="review-rating">Оценка</label>
          <select
            id="review-rating"
            value={form.rating}
            onChange={(e) => setForm((prev) => ({ ...prev, rating: Number(e.target.value) }))}
          >
            {RATING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {renderStars(option)} {option}
              </option>
            ))}
          </select>

          <label htmlFor="review-text">Отзыв</label>
          <textarea
            id="review-text"
            value={form.review_text}
            onChange={(e) => setForm((prev) => ({ ...prev, review_text: e.target.value }))}
            placeholder="Поделитесь вашим опытом..."
            rows={5}
            required
          />

          <button type="submit" disabled={isSending}>
            {isSending ? 'Отправка...' : 'Отправить отзыв'}
          </button>
          {errorMessage ? <div className="review-form__error">{errorMessage}</div> : null}
          <p>Ваш отзыв поможет другим сделать правильный выбор.</p>
        </form>

        <div className="reviews-list">
          <div className={`reviews-summary${reviews.length === 0 ? ' reviews-summary--empty' : ''}`}>
            <strong>{averageRating}</strong>
            <div>
              <h3>{reviews.length} отзывов</h3>
              <p>Спасибо за обратную связь!</p>
            </div>
          </div>

          {isLoading ? (
            <p className="reviews-empty">Загружаем отзывы...</p>
          ) : reviews.length === 0 ? (
            <p className="reviews-empty">Пока нет отзывов. Станьте первым!</p>
          ) : (
            <div className="reviews-items">
              {reviews.map((item) => (
                <article className="review-item" key={`${item.id}-${item.created_at}`}>
                  <div className="review-item__header">
                    <div className="review-item__author">
                      <span className="review-item__avatar">👤</span>
                      <div>
                        <h4>{item.author_name}</h4>
                        <time dateTime={item.created_at}>
                          {new Date(item.created_at).toLocaleDateString('ru-RU')}
                        </time>
                      </div>
                    </div>
                    <span className="review-item__stars">{renderStars(Number(item.rating || 5))}</span>
                  </div>
                  <p>{item.review_text}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

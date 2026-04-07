import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, PRODUCTS } from '../data/products';
import './FavoritesPage.css';

export default function FavoritesPage({
  favoriteIds = [],
  cartItems = [],
  catalogProducts = [],
  onToggleFavorite,
  onAddToCart,
}) {
  const favoriteProducts = useMemo(() => {
    const favoriteSet = new Set(favoriteIds);
    const merged = [
      ...PRODUCTS.map((item) => ({
        id: item.id,
        name: item.title,
        image_url: item.image,
        price: item.price,
        power: item.power,
        cooling: item.cooling,
      })),
      ...catalogProducts,
    ];
    const byId = new Map();
    merged.forEach((item) => {
      if (!byId.has(item.id)) byId.set(item.id, item);
    });
    return Array.from(byId.values()).filter((item) => favoriteSet.has(item.id));
  }, [catalogProducts, favoriteIds]);

  const cartMap = new Map(cartItems.map((item) => [item.id, item.qty]));

  return (
    <section className="favorites-page">
      <div className="favorites-page__container">
        <h1 className="favorites-page__title">Избранное</h1>

        {favoriteProducts.length === 0 ? (
          <div className="favorites-page__empty">
            <p>В избранном пока пусто.</p>
            <Link to="/katalog">Перейти в каталог</Link>
          </div>
        ) : (
          <div className="favorites-grid">
            {favoriteProducts.map((item) => (
              <article key={item.id} className="favorites-item">
                <img src={item.image_url || item.image} alt={item.name || item.title} className="favorites-item__image" />
                <div className="favorites-item__content">
                  <h2>{item.name || item.title}</h2>
                  <div className="favorites-item__meta">
                    <span>Мощность: {item.power || '2.6 кВт'}</span>
                    <span>Охлаждение: {item.cooling || '2.6 кВт'}</span>
                  </div>
                  <div className="favorites-item__bottom">
                    <strong>{formatPrice(item.price)}</strong>
                    <div className="favorites-item__actions">
                      <button type="button" onClick={() => onAddToCart?.(item)}>
                        <img src="/img/icon-cart.png" alt="" aria-hidden="true" />
                        В корзину
                        {cartMap.get(item.id) ? <em>{cartMap.get(item.id)}</em> : null}
                      </button>
                      <button
                        type="button"
                        className="favorites-item__remove"
                        onClick={() => onToggleFavorite?.(item.id)}
                      >
                        Убрать
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


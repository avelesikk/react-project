import { Link } from 'react-router-dom';
import './PopularModelsSection.css';
import { formatPrice, PRODUCTS } from '../data/products';

export default function PopularModelsSection({
  favoriteIds = [],
  onToggleFavorite,
  onAddToCart,
  catalogProducts = [],
}) {
  const favorites = new Set(favoriteIds);
  const normalizedCatalog = Array.isArray(catalogProducts) ? catalogProducts : [];

  const findCatalogProduct = (title) => {
    const normalizedTitle = String(title || '').trim().toLowerCase();
    if (!normalizedTitle) return null;
    return normalizedCatalog.find((item) => String(item?.name || '').trim().toLowerCase() === normalizedTitle) || null;
  };

  return (
    <section className="products-section" id="catalog">
      <div className="container">
        <h2 className="section-title">Популярные модели кондиционеров</h2>
        <p className="section-subtitle">
          Мы предлагаем широкий выбор сплит-систем от ведущих производителей
        </p>

        <div className="products-grid">
          {PRODUCTS.map((p, idx) => {
            const matchedCatalogProduct = findCatalogProduct(p.title);
            const targetId = matchedCatalogProduct?.id || p.id;
            const targetLink = matchedCatalogProduct ? `/katalog/${targetId}` : '/katalog';
            const isFav = favorites.has(targetId);
            return (
              <article key={p.id} className={`product-card${idx === 1 ? ' product-card--center' : ''}`}>
                <div className="product-image">
                  <img src={p.image} alt={p.title} />

                  <button
                    type="button"
                    className={`favorite-btn${isFav ? ' favorite-btn--active' : ''}`}
                    aria-label={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                    aria-pressed={isFav}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite?.(targetId);
                    }}
                  >
                  <img
                    className="favorite-icon-outline"
                    src="/img/icon-heart.png"
                    alt=""
                    aria-hidden="true"
                  />
                  <img
                    className="favorite-icon-fill"
                    src="/img/icon-heart-filled.png"
                    alt=""
                    aria-hidden="true"
                  />
                  </button>
                </div>

                <div className="product-content">
                  <h3>
                    <Link to={targetLink} className="product-title-link">
                      {p.title}
                    </Link>
                  </h3>
                  <p className="product-description">{p.description}</p>

                  <div className="product-specs-grid">
                    <div className="spec-col">
                      <span className="spec-col__label">Мощность</span>
                      <span className="spec-col__value">{p.power}</span>
                    </div>
                    <div className="spec-col">
                      <span className="spec-col__label">Охлаждение</span>
                      <span className="spec-col__value">{p.cooling}</span>
                    </div>
                  </div>

                  <div className="product-bottom">
                    <div className="product-price">{formatPrice(p.price)}</div>
                    <button
                      type="button"
                      className="add-cart-btn"
                      onClick={() => onAddToCart?.(matchedCatalogProduct || p.id)}
                      aria-label="Добавить в корзину"
                    >
                      <img src="/img/icon-cart.png" alt="" aria-hidden="true" />
                      <span>В корзину</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


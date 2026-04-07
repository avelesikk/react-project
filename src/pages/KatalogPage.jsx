import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/products';
import { getProducts } from '../api/productsApi';
import './KatalogPage.css';

const PAGE_SIZE = 9;
const BRAND_LIST = ['LG', 'Haier', 'Samsung', 'ELECTROLUX', 'Toshiba'];

export default function KatalogPage({ favoriteIds = [], onToggleFavorite, onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    colors: [],
    minPrice: '',
    maxPrice: '',
    brands: [],
  });
  const [draftFilters, setDraftFilters] = useState(filters);
  const [sort, setSort] = useState('default');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    getProducts()
      .then((items) => setProducts(items))
      .catch(() => setError('Не удалось загрузить каталог.'));
  }, []);

  const favoriteSet = new Set(favoriteIds);
  const orderedProducts = useMemo(() => {
    if (products.length <= PAGE_SIZE) return products;
    const firstPage = products.slice(0, PAGE_SIZE);
    const secondPage = products.slice(PAGE_SIZE, PAGE_SIZE * 2);
    const rest = products.slice(PAGE_SIZE * 2);
    if (!secondPage.length) return products;
    return [...secondPage, ...firstPage, ...rest];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = orderedProducts.filter((item) => {
      if (filters.colors.length && !filters.colors.includes(item.color)) return false;
      const price = Number(item.price || 0);
      if (filters.minPrice && price < Number(filters.minPrice)) return false;
      if (filters.maxPrice && price > Number(filters.maxPrice)) return false;
      if (filters.brands.length && !filters.brands.includes(item.brand)) return false;
      return true;
    });
    if (sort === 'price_asc') return [...filtered].sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price_desc') return [...filtered].sort((a, b) => Number(b.price) - Number(a.price));
    return filtered;
  }, [orderedProducts, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const pageItems = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <section className="katalog-page">
      <div className="katalog-page__container">
        <h1>Каталог</h1>
        <div className="katalog-toolbar">
          <button
            type="button"
            className="katalog-toolbar__filter-btn"
            onClick={() => {
              setDraftFilters(filters);
              setIsFilterOpen(true);
            }}
          >
            <img src="/img/filter-settings.png" alt="" aria-hidden="true" />
            <span>Фильтры</span>
          </button>

          <div className="katalog-sort-wrap">
            <button
              type="button"
              className="katalog-sort-btn"
              onClick={() => setIsSortOpen((prev) => !prev)}
            >
              Сортировка
              <span aria-hidden="true">▾</span>
            </button>
            {isSortOpen ? (
              <div className="katalog-sort-menu">
                <button
                  type="button"
                  onClick={() => {
                    setSort('default');
                    setIsSortOpen(false);
                  }}
                >
                  По умолчанию
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSort('price_asc');
                    setIsSortOpen(false);
                  }}
                >
                  Цена: по возрастанию
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSort('price_desc');
                    setIsSortOpen(false);
                  }}
                >
                  Цена: по убыванию
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {error ? <p className="katalog-page__empty">{error}</p> : null}
        {!error && filteredProducts.length === 0 ? <p className="katalog-page__empty">Товаров пока нет.</p> : null}

        <div className="katalog-grid">
          {pageItems.map((item) => (
            <article key={item.id} className="katalog-card">
              <div className="katalog-card__image-wrap">
                <img className="katalog-card__image" src={item.image_url} alt={item.name} />
                <button
                  type="button"
                  className={`favorite-btn${favoriteSet.has(item.id) ? ' favorite-btn--active' : ''}`}
                  aria-label={favoriteSet.has(item.id) ? 'Убрать из избранного' : 'Добавить в избранное'}
                  onClick={() => onToggleFavorite?.(item.id)}
                >
                  <img className="favorite-icon-outline" src="/img/icon-heart.png" alt="" aria-hidden="true" />
                  <img className="favorite-icon-fill" src="/img/icon-heart-filled.png" alt="" aria-hidden="true" />
                </button>
              </div>
              <div className="katalog-card__content">
                <Link to={`/katalog/${item.id}`} className="katalog-card__name">
                  {item.name}
                </Link>
                <div className="katalog-specs-grid">
                  <div className="katalog-spec-col">
                    <span className="katalog-spec-col__label">Мощность</span>
                    <span className="katalog-spec-col__value">{item.power || '2.6 кВт'}</span>
                  </div>
                  <div className="katalog-spec-col">
                    <span className="katalog-spec-col__label">Охлаждение</span>
                    <span className="katalog-spec-col__value">{item.cooling || '2.6 кВт'}</span>
                  </div>
                </div>
                <div className="katalog-card__bottom-row">
                  <p className="katalog-card__price">{formatPrice(item.price)}</p>
                  <button type="button" className="katalog-add-cart-btn" onClick={() => onAddToCart?.(item)}>
                    <img src="/img/icon-cart.png" alt="" aria-hidden="true" />
                    <span>В корзину</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length > PAGE_SIZE ? (
          <div className="katalog-pagination">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                className={`katalog-page-btn${pageNum === page ? ' katalog-page-btn--active' : ''}`}
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isFilterOpen ? (
        <div className="katalog-filter-overlay" onClick={() => setIsFilterOpen(false)}>
          <aside className="katalog-filter-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="katalog-filter-drawer__head">
              <h2>Фильтры</h2>
              <button type="button" onClick={() => setIsFilterOpen(false)}>
                ✕
              </button>
            </div>
            <div className="katalog-filter-drawer__body">
              <div className="katalog-price-group">
                <p>Цена</p>
                <div className="katalog-price-row">
                  <input
                    type="number"
                    min="0"
                    value={draftFilters.minPrice}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                    placeholder="от"
                  />
                  <input
                    type="number"
                    min="0"
                    value={draftFilters.maxPrice}
                    onChange={(e) => setDraftFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                    placeholder="до"
                  />
                </div>
              </div>
              <div className="katalog-brand-group">
                <p>Цвет</p>
                <div className="katalog-brand-list">
                  {[
                    { id: 'gray', label: 'Серый' },
                    { id: 'black', label: 'Черный' },
                    { id: 'white', label: 'Белый' },
                  ].map((colorItem) => {
                    const isActive = draftFilters.colors.includes(colorItem.id);
                    return (
                      <label
                        key={colorItem.id}
                        className={`katalog-brand-chip${isActive ? ' katalog-brand-chip--active' : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              colors: prev.colors.includes(colorItem.id)
                                ? prev.colors.filter((c) => c !== colorItem.id)
                                : [...prev.colors, colorItem.id],
                            }))
                          }
                        />
                        <span>{colorItem.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="katalog-brand-group">
                <p>Бренд</p>
                <div className="katalog-brand-list">
                  {BRAND_LIST.map((brand) => {
                    const isActive = draftFilters.brands.includes(brand);
                    return (
                      <label key={brand} className={`katalog-brand-chip${isActive ? ' katalog-brand-chip--active' : ''}`}>
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() =>
                            setDraftFilters((prev) => ({
                              ...prev,
                              brands: prev.brands.includes(brand)
                                ? prev.brands.filter((b) => b !== brand)
                                : [...prev.brands, brand],
                            }))
                          }
                        />
                        <span>{brand}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="katalog-filter-drawer__foot">
              <button
                type="button"
                className="katalog-filter-apply"
                onClick={() => {
                  setFilters(draftFilters);
                  setIsFilterOpen(false);
                }}
              >
                Применить
              </button>
              <button
                type="button"
                className="katalog-filter-reset"
                onClick={() => {
                  const reset = { colors: [], minPrice: '', maxPrice: '', brands: [] };
                  setDraftFilters(reset);
                  setFilters(reset);
                  setIsFilterOpen(false);
                }}
              >
                Сбросить
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}


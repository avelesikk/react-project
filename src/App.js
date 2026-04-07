import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CookieBanner from './components/CookieBanner';
import AuthPage from './pages/AuthPage';
import CartPage from './pages/CartPage';
import KatalogPage from './pages/KatalogPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
import FavoritesPage from './pages/FavoritesPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminProductFormPage from './pages/AdminProductFormPage';
import ProductPage from './pages/ProductPage';
import PersonalCabinetPage from './pages/PersonalCabinetPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import NotFoundPage from './pages/NotFoundPage';
import { getProducts } from './api/productsApi';
import { PRODUCTS as HOME_PRODUCTS } from './data/products';
import { clearUserSession, readUserSession, saveUserSession } from './utils/userSession';
import './App.css';

const FAVORITES_STORAGE_KEY = 'favorites-models';
const CART_STORAGE_KEY = 'cart-models';

function readStorageArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [favoriteIds, setFavoriteIds] = useState(() => readStorageArray(FAVORITES_STORAGE_KEY));
  const [cartItems, setCartItems] = useState(() => readStorageArray(CART_STORAGE_KEY));
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [userSession, setUserSession] = useState(() => readUserSession());
  const isLoggedIn = Boolean(userSession?.token);

  useEffect(() => {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    getProducts()
      .then((items) => setCatalogProducts(items))
      .catch(() => setCatalogProducts([]));
  }, []);

  const availableIds = useMemo(() => {
    const ids = new Set();
    HOME_PRODUCTS.forEach((item) => ids.add(item.id));
    catalogProducts.forEach((item) => ids.add(item.id));
    return ids;
  }, [catalogProducts]);

  const favoritesCount = useMemo(
    () => favoriteIds.filter((id) => availableIds.has(id)).length,
    [favoriteIds, availableIds]
  );
  const cartCount = useMemo(() => {
    return cartItems.reduce((sum, item) => {
      const isValid = Boolean(item?.product) || availableIds.has(item.id);
      if (!isValid) return sum;
      return sum + (item.qty || 0);
    }, 0);
  }, [cartItems, availableIds]);

  const toggleFavorite = (id) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const resolveProduct = (value) => {
    if (typeof value === 'object' && value) return value;
    const id = value;
    const fromHome = HOME_PRODUCTS.find((item) => item.id === id);
    if (fromHome) {
      return {
        id: fromHome.id,
        name: fromHome.title,
        image_url: fromHome.image,
        price: fromHome.price,
      };
    }
    return catalogProducts.find((item) => item.id === id) || null;
  };

  const addToCart = (value) => {
    const product = resolveProduct(value);
    if (!product) return;
    const id = product.id;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (!existing) return [...prev, { id, qty: 1, product }];
      return prev.map((item) =>
        item.id === id ? { ...item, qty: item.qty + 1, product: item.product || product } : item
      );
    });
  };

  const setCartItemQty = (id, qty) => {
    setCartItems((prev) => {
      if (qty <= 0) return prev.filter((item) => item.id !== id);
      return prev.map((item) => (item.id === id ? { ...item, qty } : item));
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="app-shell">
      {!isAdminRoute ? <Header favoritesCount={favoritesCount} cartCount={cartCount} isLoggedIn={isLoggedIn} /> : null}
      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
                catalogProducts={catalogProducts}
              />
            }
          />
          <Route
            path="/auth"
            element={
              <AuthPage
                userSession={userSession}
                onLogin={(session) => {
                  saveUserSession(session);
                  setUserSession(session);
                }}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                cartItems={cartItems}
                onAddToCart={addToCart}
                onSetCartItemQty={setCartItemQty}
                onRemoveFromCart={removeFromCart}
                isLoggedIn={isLoggedIn}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                catalogProducts={catalogProducts}
                userSession={userSession}
                onClearCart={clearCart}
              />
            }
          />
          <Route
            path="/katalog"
            element={
              <KatalogPage
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
              />
            }
          />
          <Route
            path="/katalog/:productId"
            element={
              <ProductPage
                onAddToCart={addToCart}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route
            path="/account"
            element={
              <PersonalCabinetPage
                userSession={userSession}
                onUserLogout={() => {
                  clearUserSession();
                  setUserSession(null);
                }}
              />
            }
          />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/admin/panel" element={<AdminPanelPage />} />
          <Route path="/admin/panel/add" element={<AdminProductFormPage />} />
          <Route path="/admin/panel/edit/:productId" element={<AdminProductFormPage />} />
          <Route
            path="/favorites"
            element={
              <FavoritesPage
                favoriteIds={favoriteIds}
                cartItems={cartItems}
                catalogProducts={catalogProducts}
                onToggleFavorite={toggleFavorite}
                onAddToCart={addToCart}
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {!isAdminRoute ? <Footer /> : null}
      {!isAdminRoute ? <CookieBanner /> : null}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header({ favoritesCount = 0, cartCount = 0, isLoggedIn = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const burgerRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    if (!isMenuOpen) return;
    const onPointerDown = (e) => {
      const t = e.target;
      if (navRef.current?.contains(t) || burgerRef.current?.contains(t)) return;
      closeMenu();
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [isMenuOpen]);

  return (
    <header className="site-header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <img src="/img/logo1.webp" alt="Aira" className="logo-img" />
          </Link>
        </div>

        <nav className="header-nav-desktop" aria-label="Основная навигация">
          <ul>
            <li>
              <Link to="/katalog" onClick={closeMenu}>
                Каталог
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMenu}>
                О компании
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={closeMenu}>
                Связаться с нами
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-actions header-actions--desktop">
          <div className="header-phone" aria-label="+7 (4912) 12-34-56">
            <span className="header-phone__icon" aria-hidden="true" />
            <span className="header-phone__text">+7 (4912) 12-34-56</span>
          </div>

          <Link to="/favorites" className="cart-link icon-link icon-link--heart" aria-label="Избранное" onClick={closeMenu}>
            <img className="header-icon-img" src="/img/icon-heart.png" alt="" />
            {favoritesCount > 0 ? <span className="header-badge">{favoritesCount}</span> : null}
          </Link>

          <Link to="/cart" className="cart-link icon-link" aria-label="Корзина" onClick={closeMenu}>
            <img className="header-icon-img" src="/img/icon-cart.png" alt="" />
            {cartCount > 0 ? <span className="header-badge">{cartCount}</span> : null}
          </Link>

          <Link to={isLoggedIn ? '/account' : '/auth'} className="cart-link icon-link" aria-label="Войти" onClick={closeMenu}>
            <img className="header-icon-img" src="/img/icon-user.png" alt="" />
          </Link>
        </div>

        <div className="header-actions header-actions--mobile">
          <div className="header-phone header-phone--mobile" aria-label="+7 (4912) 12-34-56">
            <span className="header-phone__icon" aria-hidden="true" />
            <span className="header-phone__text">+7 (4912) 12-34-56</span>
          </div>

          <Link to="/favorites" className="cart-link icon-link icon-link--heart" aria-label="Избранное" onClick={closeMenu}>
            <img className="header-icon-img" src="/img/icon-heart.png" alt="" />
            {favoritesCount > 0 ? <span className="header-badge">{favoritesCount}</span> : null}
          </Link>

          <Link to="/cart" className="cart-link icon-link" aria-label="Корзина" onClick={closeMenu}>
            <img className="header-icon-img" src="/img/icon-cart.png" alt="" />
            {cartCount > 0 ? <span className="header-badge">{cartCount}</span> : null}
          </Link>

          <Link to={isLoggedIn ? '/account' : '/auth'} className="cart-link icon-link" aria-label="Войти" onClick={closeMenu}>
            <img className="header-icon-img" src="/img/icon-user.png" alt="" />
          </Link>
        </div>

        <nav id="main-nav" ref={navRef} className={isMenuOpen ? 'open' : ''}>
          <ul>
            <li>
              <Link to="/katalog" onClick={closeMenu}>
                Каталог
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={closeMenu}>
                О компании
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={closeMenu}>
                Связаться с нами
              </Link>
            </li>
            <li className="main-nav-phone">
              <span>+7 (4912) 12-34-56</span>
            </li>
          </ul>
        </nav>

        <div
          ref={burgerRef}
          className={`burger-menu ${isMenuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Открыть меню"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') toggleMenu();
          }}
        >
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>
    </header>
  );
}


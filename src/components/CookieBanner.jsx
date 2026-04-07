import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './CookieBanner.css';

const COOKIE_CONSENT_KEY = 'cookie-consent-v1';

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(COOKIE_CONSENT_KEY) === 'accepted';
      setIsVisible(!accepted);
    } catch {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    } catch {
      // no-op
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Уведомление об использовании файлов cookie">
      <div className="cookie-banner__content">
        <p>
          Мы используем файлы cookie для улучшения работы сайта, персонализации контента и анализа трафика. Используя
          наш сайт, вы соглашаетесь с нашей{' '}
          <Link to="/privacy-policy" className="cookie-banner__link">
            Политикой конфиденциальности
          </Link>
          .
        </p>
        <button type="button" className="cookie-banner__btn" onClick={acceptCookies}>
          Принять
        </button>
      </div>
    </div>
  );
}


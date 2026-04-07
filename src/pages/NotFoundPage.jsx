import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export default function NotFoundPage() {
  return (
    <section className="not-found-page">
      <div className="container not-found-wrap">
        <div className="not-found-visual" aria-hidden="true">
          <span className="not-found-visual__code">404</span>
        </div>

        <div className="not-found-content">
          <h1>Упс, такой страницы нет</h1>
          <p>
            Возможно, адрес введен с ошибкой или нужная страница временно недоступна. Перейдите на главную, чтобы
            продолжить работу с сайтом.
          </p>
          <Link to="/" className="not-found-btn">
            На главную
          </Link>
        </div>
      </div>
    </section>
  );
}


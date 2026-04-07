import { Link } from 'react-router-dom';
import './SeasonalComfortSection.css';

const BENEFITS = [
  'Функция обогрева для зимы',
  'Осушение и увлажнение воздуха',
  'Автоматический режим',
  'Таймер и расписание включения',
];

const SEASONS = [
  { id: 'summer', icon: '❄️', title: 'Лето', value: '-18°C' },
  { id: 'winter', icon: '🔥', title: 'Зима', value: '+30°C' },
  { id: 'spring', icon: '💨', title: 'Весна', value: 'Осушение' },
  { id: 'autumn', icon: '🍃', title: 'Осень', value: 'Вентиляция' },
];

export default function SeasonalComfortSection() {
  return (
    <section className="seasonal-comfort">
      <div className="container seasonal-comfort__container">
        <div className="seasonal-comfort__content">
          <h2>Комфорт в любое время года</h2>
          <p>
            Летом охлаждение достигает -18°C, зимой обогрев до +30°C. Поддерживайте идеальную
            температуру и влажность воздуха дома или в офисе весь год.
          </p>
          <ul>
            {BENEFITS.map((item) => (
              <li key={item}>
                <span>✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link to="/katalog" className="seasonal-comfort__btn">
            В каталог
          </Link>
        </div>

        <div className="seasonal-comfort__grid">
          {SEASONS.map((card) => (
            <article key={card.id} className="seasonal-card">
              <span className="seasonal-card__icon" aria-hidden="true">
                {card.icon}
              </span>
              <h3>{card.title}</h3>
              <p>{card.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

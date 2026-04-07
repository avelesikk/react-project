import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './HeroSlider.css';

const SLIDES = [
  { image: '/img/slide3.jpg' },
  { image: '/img/111.jpg' },
];

const TITLE = 'Качественная установка кондиционеров';
const TEXT =
  'Профессиональный монтаж с гарантией до 3 лет. Быстро, чисто и надежно. Работаем в Рязани и области.';

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [timerKey, setTimerKey] = useState(0);
  const len = SLIDES.length;

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % len);
    }, 5000);
    return () => clearInterval(id);
  }, [len, timerKey]);

  const goTo = (index) => {
    setCurrent(index);
    setTimerKey((k) => k + 1);
  };

  return (
    <section className="hero-slider">
      <div className="slides-container">
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className={`slide${i === current ? ' active' : ''}`}
            style={{ backgroundImage: `url('${s.image}')` }}
          >
            <div className="slide-content">
              <h1>{TITLE}</h1>
              <p>{TEXT}</p>
              <Link to="/katalog" className="btn-hero">
                Подробнее
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className="slider-dots">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`dot${i === current ? ' active' : ''}`}
            aria-label={`Слайд ${i + 1}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  );
}

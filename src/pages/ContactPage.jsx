import { useEffect } from 'react';
import './ContactPage.css';

export default function ContactPage() {
  useEffect(() => {
    const mapRoot = document.getElementById('yandex-map');
    if (!mapRoot) return;
    const mapHeight = window.innerWidth <= 480 ? 240 : window.innerWidth <= 768 ? 280 : 400;

    mapRoot.innerHTML = '';
    const script = document.createElement('script');
    script.src =
      `https://api-maps.yandex.ru/services/constructor/1.0/js/?um=constructor%3A9f31624eb77861ead27b0e8ac1618530222a5ab1919052f4e44b1e7301734288&width=100%25&height=${mapHeight}&lang=ru_RU&scroll=true`;
    script.async = true;
    mapRoot.appendChild(script);
  }, []);

  return (
    <section className="find-us-section">
      <div className="container">
        <h2 className="section-title">Как нас найти</h2>

        <div className="find-us-wrapper">
          <div className="map-container">
            <div id="yandex-map" />
          </div>

          <div className="contact-info">
            <h3>Контакты</h3>

            <div className="item">
              <div className="contact-details">
                <h4>Адрес</h4>
                <p>г. Рязань, ул. Промышленная, 15</p>
              </div>
            </div>

            <div className="item">
              <div className="contact-details">
                <h4>Режим работы</h4>
                <p>
                  <strong>Понедельник - Пятница:</strong> 9:00 - 18:00
                </p>
                <p>
                  <strong>Суббота:</strong> 10:00 - 16:00
                </p>
                <p>
                  <strong>Воскресенье:</strong> выходной
                </p>
              </div>
            </div>

            <div className="item">
              <div className="contact-details">
                <h4>Телефон</h4>
                <p>+7 (4912) 12-34-56</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


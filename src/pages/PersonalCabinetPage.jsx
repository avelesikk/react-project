import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { cancelUserOrder, getUserOrders, logoutUser } from '../api/authApi';
import { formatPrice } from '../data/products';
import './PersonalCabinetPage.css';

function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ru-RU');
}

function formatBirthDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('ru-RU');
}

function localizeOrderStatus(status) {
  const map = {
    new: 'Новый',
    processing: 'В обработке',
    completed: 'Выполнен',
    cancelled: 'Отменен',
  };
  return map[String(status || '').toLowerCase()] || 'Новый';
}

export default function PersonalCabinetPage({ userSession, onUserLogout }) {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(0);

  const token = userSession?.token || '';
  const user = userSession?.user || null;

  useEffect(() => {
    if (!userSession?.token) return;
    setIsLoading(true);
    getUserOrders(userSession)
      .then((data) => setOrders(Array.isArray(data?.orders) ? data.orders : []))
      .catch((e) => {
        const message = String(e?.message || 'Не удалось загрузить заказы.');
        if (message.toLowerCase().includes('сессия истекла')) {
          setOrders([]);
          setError('');
          return;
        }
        setError(message);
      })
      .finally(() => setIsLoading(false));
  }, [userSession]);

  const ordersCount = useMemo(() => orders.length, [orders]);
  const hasOrdersWithItems = useMemo(
    () => orders.some((order) => Array.isArray(order?.items) && order.items.length > 0),
    [orders]
  );

  if (!token || !user) return <Navigate to="/auth" replace />;

  return (
    <section className="cabinet-page">
      <div className="cabinet-container">
        <div className="cabinet-welcome">
          <div className="cabinet-welcome__row">
            <h1>Добро пожаловать, {user.first_name}</h1>
            <button
              type="button"
              className="cabinet-logout"
              onClick={async () => {
                try {
                  await logoutUser(userSession);
                } catch {
                  // no-op
                } finally {
                  onUserLogout?.();
                }
              }}
            >
              Выйти из аккаунта
            </button>
          </div>
        </div>

        <div className="cabinet-top">
          <div className="cabinet-profile-plain">
            <p>
              <strong>ФИО:</strong> {user.full_name || '-'}
            </p>
            <p>
              <strong>Дата рождения:</strong> {formatBirthDate(user.age)}
            </p>
            <p>
              <strong>Email:</strong> {user.email || '-'}
            </p>
            <p>
              <strong>Телефон:</strong> {user.phone_number || '-'}
            </p>
          </div>
        </div>

        <article className="cabinet-orders-box">
          <h2>Ваши заказы</h2>
          <div className="cabinet-orders-inner">
            {isLoading ? <p>Загружаем...</p> : null}
            {!isLoading && error ? <p className="cabinet-error">{error}</p> : null}
            {!isLoading && !error && ordersCount === 0 ? (
              <p>Пока здесь пусто. Оформленные товары и заказы появятся в этом разделе.</p>
            ) : null}
            {!isLoading && !error && ordersCount > 0 ? (
              <div className="cabinet-orders">
                {orders.map((order) => (
                  <div key={order.id} className="cabinet-order-row">
                    <div className="cabinet-order-row__left">
                      <strong>Заказ #{order.id}</strong>
                      <span>{formatOrderDate(order.created_at)}</span>
                    </div>
                    <div className="cabinet-order-row__items">
                      {Array.isArray(order.items) && order.items.length > 0 ? (
                        order.items.map((item) => (
                          <div key={`${order.id}-${item.id}-${item.title}`} className="cabinet-order-item">
                            <span className="cabinet-order-item__name">
                              {item.title} <span className="cabinet-order-item__qty">x{item.qty}</span>
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="cabinet-order-item__name">Состав заказа недоступен</span>
                      )}
                    </div>
                    <div className="cabinet-order-row__right">
                      <strong>{formatPrice(order.total_price)}</strong>
                      <span>Статус: {localizeOrderStatus(order.status)}</span>
                    </div>
                    {String(order.status) === 'new' ? (
                      <button
                        type="button"
                        className="cabinet-order-cancel-btn"
                        disabled={cancellingOrderId === order.id}
                        onClick={async () => {
                          const isConfirmed = window.confirm(`Вы уверены, что хотите отменить заказ #${order.id}?`);
                          if (!isConfirmed) return;
                          try {
                            setError('');
                            setCancellingOrderId(order.id);
                            await cancelUserOrder(userSession, order.id);
                            setOrders((prev) =>
                              prev.map((item) => (item.id === order.id ? { ...item, status: 'cancelled' } : item))
                            );
                            window.alert('Заказ отменен.');
                          } catch (e) {
                            setError(e.message || 'Не удалось отменить заказ.');
                          } finally {
                            setCancellingOrderId(0);
                          }
                        }}
                      >
                        {cancellingOrderId === order.id ? 'Отменяем...' : 'Отменить заказ'}
                      </button>
                    ) : <div className="cabinet-order-cancel-placeholder" />}
                  </div>
                ))}
              </div>
            ) : null}
            {!isLoading && !error && ordersCount > 0 && !hasOrdersWithItems ? (
              <p className="cabinet-orders-hint">Детали заказа появятся для новых оформлений.</p>
            ) : null}
            <Link to="/katalog" className="cabinet-catalog-btn">
              В каталог
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getAdminOrders, updateAdminOrderStatus } from '../api/adminApi';
import { deleteProduct, getProducts } from '../api/productsApi';
import { formatPrice } from '../data/products';
import { clearAdminSession, getAdminUser, isAdminSessionActive } from '../utils/adminSession';
import './AdminPanelPage.css';

const ORDER_STATUS_LABEL = {
  new: 'Новый',
  processing: 'В обработке',
  completed: 'Выполнен',
  cancelled: 'Отменен',
};

function formatOrderDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('ru-RU');
}

export default function AdminPanelPage() {
  const isAdminLoggedIn = isAdminSessionActive();
  const adminUser = getAdminUser();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [ordersError, setOrdersError] = useState('');
  const [savingOrderId, setSavingOrderId] = useState(0);

  const loadProducts = () => {
    getProducts()
      .then((items) => setProducts(items))
      .catch(() => setError('Не удалось загрузить карточки.'));
  };

  const loadOrders = () => {
    getAdminOrders()
      .then((data) => setOrders(Array.isArray(data?.orders) ? data.orders : []))
      .catch((e) => setOrdersError(e.message || 'Не удалось загрузить заказы.'));
  };

  useEffect(() => {
    if (!isAdminLoggedIn) return;
    loadProducts();
    loadOrders();
  }, [isAdminLoggedIn]);

  if (!isAdminLoggedIn) return <Navigate to="/admin" replace />;

  return (
    <section className="admin-panel-page">
      <div className="admin-container">
        <h1 className="admin-title">Административная панель</h1>
        <p className="admin-welcome">Добро пожаловать, {adminUser}</p>
        <p className="admin-subtitle">Карточки товара</p>
        <Link to="/admin/panel/add" className="admin-btn admin-btn--link">
          Добавить
        </Link>

        {error ? <p className="admin-error">{error}</p> : null}

        <hr className="admin-hr" />

        <div className="admin-products-table">
          <div className="admin-products-header">
            <span>Название</span>
            <span>Картинка</span>
            <span>Цена</span>
            <span>Действие</span>
          </div>
          {products.map((item) => (
            <article key={item.id} className="admin-product-row">
              <div className="admin-product-name">{item.name}</div>
              <img src={item.image_url} alt={item.name} />
              <div className="admin-product-price">{formatPrice(item.price)}</div>
              <div className="admin-product-actions">
                <Link
                  to={`/admin/panel/edit/${item.id}`}
                  className="admin-link"
                  onClick={(e) => {
                    if (!window.confirm('Вы уверены, что хотите изменить карточку?')) {
                      e.preventDefault();
                    }
                  }}
                >
                  Изменить
                </Link>
                <button
                  type="button"
                  className="admin-link admin-link--button admin-link--danger"
                  onClick={async () => {
                    if (!window.confirm('Вы уверены, что хотите удалить карточку?')) return;
                    try {
                      setError('');
                      await deleteProduct(item.id);
                      loadProducts();
                    } catch (err) {
                      setError(err.message || 'Не удалось удалить товар.');
                    }
                  }}
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
        </div>

        <hr className="admin-hr" />

        <h2 className="admin-subtitle">Заказы</h2>
        {ordersError ? <p className="admin-error">{ordersError}</p> : null}
        {orders.length ? (
          <div className="admin-orders-table">
            <div className="admin-orders-header">
              <span>ID</span>
              <span>Клиент</span>
              <span>Контакты</span>
              <span>Сумма</span>
              <span>Дата</span>
              <span>Статус</span>
            </div>
            {orders.map((order) => (
              <article key={order.id} className="admin-order-row">
                <div>#{order.id}</div>
                <div>{order.customer_name || '-'}</div>
                <div className="admin-order-contacts">
                  <span>{order.customer_email || '-'}</span>
                  <span>{order.customer_phone || '-'}</span>
                </div>
                <div>{formatPrice(order.total_price || 0)}</div>
                <div>{formatOrderDate(order.created_at)}</div>
                <div className="admin-order-status">
                  <select
                    value={order.status}
                    disabled={savingOrderId === order.id}
                    onChange={async (e) => {
                      const nextStatus = e.target.value;
                      try {
                        setSavingOrderId(order.id);
                        setOrdersError('');
                        await updateAdminOrderStatus(order.id, nextStatus);
                        setOrders((prev) =>
                          prev.map((item) => (item.id === order.id ? { ...item, status: nextStatus } : item))
                        );
                      } catch (err) {
                        setOrdersError(err.message || 'Не удалось обновить статус.');
                      } finally {
                        setSavingOrderId(0);
                      }
                    }}
                  >
                    {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p>Заказов пока нет</p>
        )}

        <button
          type="button"
          className="admin-link admin-link--button admin-link--underline"
          onClick={() => {
            clearAdminSession();
            window.location.href = '/admin';
          }}
        >
          Выйти
        </button>
      </div>
    </section>
  );
}

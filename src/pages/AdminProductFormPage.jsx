import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { createProduct, getProductById, updateProduct } from '../api/productsApi';
import './AdminPanelPage.css';

export default function AdminProductFormPage({ userSession }) {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(productId);
  const isAdminLoggedIn = Boolean(userSession?.token) && String(userSession?.user?.role || '') === 'admin';
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    product_name: '',
    product_price: '',
    product_brand: 'Haier',
    product_color: 'white',
    product_power: '',
    product_cooling: '',
    product_description: '',
    product_picture: null,
  });

  useEffect(() => {
    if (!isEdit) return;
    getProductById(productId)
      .then((item) =>
        setForm((prev) => ({
          ...prev,
          product_name: item?.name || '',
          product_price: item?.price ? String(item.price) : '',
          product_brand: item?.brand || 'Haier',
          product_color: item?.color || 'white',
          product_power: item?.power || '',
          product_cooling: item?.cooling || '',
          product_description: item?.description || '',
        }))
      )
      .catch(() => setError('Не удалось загрузить товар для редактирования.'));
  }, [isEdit, productId]);

  if (!isAdminLoggedIn) return <Navigate to="/auth" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.product_name.trim()) return setError('Не указано название товара');
    if (!form.product_price || Number.isNaN(Number(form.product_price))) {
      return setError('Неверно указана цена');
    }

    const body = new FormData();
    body.append('product_name', form.product_name.trim());
    body.append('product_price', form.product_price);
    body.append('product_brand', form.product_brand);
    body.append('product_color', form.product_color);
    body.append('product_power', form.product_power.trim());
    body.append('product_cooling', form.product_cooling.trim());
    body.append('product_description', form.product_description.trim());
    if (form.product_picture) body.append('product_picture', form.product_picture);

    setIsLoading(true);
    try {
      if (isEdit) await updateProduct(productId, body);
      else {
        if (!form.product_picture) {
          setIsLoading(false);
          return setError('Ошибка загрузки файла');
        }
        await createProduct(body);
      }
      navigate('/admin/panel');
    } catch (err) {
      setError(err.message || 'Не удалось сохранить товар.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="admin-panel-page">
      <div className="admin-container">
        <h1 className="admin-title">Административная панель</h1>
        <p className="admin-welcome">Форма товара</p>
        <Link to="/admin/panel" className="admin-link admin-link--underline">
          Назад к карточкам
        </Link>
        {error ? <p className="admin-error">{error}</p> : null}

        <form onSubmit={onSubmit} className="admin-form admin-form--centered" encType="multipart/form-data">
          <div className="admin-form-group">
            <label htmlFor="product_name" className="admin-label">
              Название <span className="admin-required">*</span>
            </label>
            <input
              required
              type="text"
              id="product_name"
              className="admin-input"
              placeholder="Введите название товара"
              value={form.product_name}
              onChange={(e) => setForm((prev) => ({ ...prev, product_name: e.target.value }))}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="product_price" className="admin-label">
              Цена (рубли) <span className="admin-required">*</span>
            </label>
            <input
              required
              type="text"
              id="product_price"
              className="admin-input"
              placeholder="Введите цену"
              value={form.product_price}
              onChange={(e) => setForm((prev) => ({ ...prev, product_price: e.target.value }))}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="product_brand" className="admin-label">
              Бренд <span className="admin-required">*</span>
            </label>
            <select
              id="product_brand"
              className="admin-input"
              value={form.product_brand}
              onChange={(e) => setForm((prev) => ({ ...prev, product_brand: e.target.value }))}
            >
              <option value="LG">LG</option>
              <option value="Haier">Haier</option>
              <option value="Samsung">Samsung</option>
              <option value="ELECTROLUX">ELECTROLUX</option>
              <option value="Toshiba">Toshiba</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label htmlFor="product_color" className="admin-label">
              Цвет <span className="admin-required">*</span>
            </label>
            <select
              id="product_color"
              className="admin-input"
              value={form.product_color}
              onChange={(e) => setForm((prev) => ({ ...prev, product_color: e.target.value }))}
            >
              <option value="gray">Серый</option>
              <option value="black">Черный</option>
              <option value="white">Белый</option>
            </select>
          </div>
          <div className="admin-form-group">
            <label htmlFor="product_power" className="admin-label">
              Мощность
            </label>
            <input
              type="text"
              id="product_power"
              className="admin-input"
              placeholder="Например: 2.8 кВт"
              value={form.product_power}
              onChange={(e) => setForm((prev) => ({ ...prev, product_power: e.target.value }))}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="product_cooling" className="admin-label">
              Охлаждение
            </label>
            <input
              type="text"
              id="product_cooling"
              className="admin-input"
              placeholder="Например: 2.8 кВт"
              value={form.product_cooling}
              onChange={(e) => setForm((prev) => ({ ...prev, product_cooling: e.target.value }))}
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="product_picture" className="admin-label">
              Картинка {isEdit ? '' : <span className="admin-required">*</span>}
            </label>
            <input
              type="file"
              id="product_picture"
              className="admin-file-input"
              accept="image/*"
              required={!isEdit}
              onChange={(e) => setForm((prev) => ({ ...prev, product_picture: e.target.files?.[0] || null }))}
            />
          </div>
          <div className="admin-form-group">
            <button className="admin-btn" type="submit" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : isEdit ? 'Изменить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

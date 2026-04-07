import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api/adminApi';
import { isAdminSessionActive, startAdminSession } from '../utils/adminSession';
import './AdminLoginPage.css';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const isAdminLoggedIn = isAdminSessionActive();

  if (isAdminLoggedIn) return <Navigate to="/admin/panel" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await loginAdmin({ username, password });
      startAdminSession(username);
      navigate('/admin/panel');
    } catch (err) {
      setError(err.message || 'Неверные учетные данные!');
    }
  };

  return (
    <section className="admin-auth-page">
      <div className="auth-container">
        <h1>Авторизация</h1>
        {error ? <p className="auth-error">{error}</p> : null}
        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="username">Логин:</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Введите логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Войти</button>
        </form>
      </div>
    </section>
  );
}

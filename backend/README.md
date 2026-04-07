# Backend (Node.js + MySQL)

## Что реализовано

- API на Node.js (`Express`) для отзывов:
  - `GET /api/reviews`
  - `POST /api/reviews`
- Подключение к MySQL (ваша БД `city`, видна в phpMyAdmin)
- Автоматическое создание таблицы `reviews` при старте сервера

## Запуск

1. Убедитесь, что MySQL запущен (XAMPP/OpenServer/WAMP).
2. В папке `backend`:
   - `npm install`
   - `npm run start`
3. API будет доступен на `http://localhost:4000`.

## Переменные окружения

Файл: `backend/.env`

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## Таблица отзывов

Если нужно создать вручную через phpMyAdmin, используйте `backend/sql/reviews.sql`.

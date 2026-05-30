# 🚀 PipiPupu Messenger

Полнофункциональный клон Telegram Web с real-time сообщениями, каналами, звонками и многим другим!

## ✨ Возможности

### 🔐 Авторизация
- Регистрация и вход
- JWT токены для безопасности
- Управление профилем (username, bio, аватар)

### 💬 Чаты и Сообщения
- Real-time сообщения через WebSocket
- Отправка текста и эмодзи
- Загрузка файлов и изображений
- Реакции на сообщения
- Индикатор "печатает..."
- Счетчики непрочитанных сообщений

### 📢 Каналы
- Создание и управление каналами
- Только админ может писать сообщения
- Подписка на каналы

### 📞 Звонки
- Аудио и видео звонки
- Управление звонком (mute, завершить)
- UI готов для WebRTC интеграции

### 🎨 Интерфейс
- Дизайн как в Telegram Web
- Темная и светлая темы
- Полностью адаптивный (Mobile-friendly)
- Плавные анимации

## 🛠 Технологии

### Backend
- **Node.js** + **Express** - HTTP сервер
- **WebSocket (ws)** - Real-time коммуникация
- **JWT** - Аутентификация
- **Multer** - Загрузка файлов

### Frontend
- **Vanilla JavaScript** - Без фреймворков
- **Tailwind CSS** - Стилизация
- **WebSocket API** - Real-time обновления

## 📦 Установка и Запуск

### Локально

1. **Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd pipipupu-messenger
```

2. **Установите зависимости:**
```bash
npm install
```

3. **Запустите сервер:**
```bash
npm start
```

4. **Откройте в браузере:**
```
http://localhost:3000
```

### Режим разработки (с автоперезагрузкой)
```bash
npm run dev
```

## 🚀 Деплой на Railway

**Ваш URL:** https://bebebe-production-ac07.up.railway.app

### Вариант 1: Через GitHub

1. Загрузите код на GitHub
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push
   ```
2. Зайдите на [Railway.app](https://railway.app)
3. Нажмите "New Project" → "Deploy from GitHub repo"
4. Выберите ваш репозиторий
5. Railway автоматически определит Node.js и запустит проект
6. Установите переменную `JWT_SECRET` в разделе Variables
7. Приложение доступно на: https://bebebe-production-ac07.up.railway.app

### Вариант 2: Через Railway CLI

1. **Установите Railway CLI:**
```bash
npm i -g @railway/cli
```

2. **Войдите в аккаунт:**
```bash
railway login
```

3. **Инициализируйте проект:**
```bash
railway init
```

4. **Задеплойте:**
```bash
railway up
```

5. **Откройте приложение:**
```bash
railway open
```

### Переменные окружения на Railway

Установите в Railway:
```
PORT=3000
JWT_SECRET=your-super-secret-key-here
```

## 🎮 Демо-аккаунты

После запуска сервера доступны тестовые аккаунты:

| Username | Password  | Описание |
|----------|-----------|----------|
| demo     | demo123   | Основной демо-пользователь |
| alice    | alice123  | Активный пользователь |
| bob      | bob123    | Разработчик |

## 📡 API Endpoints

### Авторизация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход

### Пользователи
- `GET /users/me` - Получить текущего пользователя
- `PATCH /users/me` - Обновить профиль

### Чаты
- `GET /chats` - Получить список чатов
- `POST /chats` - Создать чат
- `GET /chats/:chatId/messages` - Получить сообщения чата

### Каналы
- `POST /channels` - Создать канал
- `POST /channels/:channelId/subscribe` - Подписаться на канал

### Файлы
- `POST /upload` - Загрузить файл

### WebSocket Events

#### Отправка (Client → Server)
```javascript
// Аутентификация
{ type: 'auth', token: 'jwt-token' }

// Отправка сообщения
{ type: 'message', payload: { chatId, text, file } }

// Индикатор печати
{ type: 'typing', payload: { chatId } }

// Реакция на сообщение
{ type: 'reaction', payload: { messageId, chatId, emoji } }

// Звонок
{ type: 'call', payload: { chatId, callType, action } }
```

#### Получение (Server → Client)
```javascript
// Новое сообщение
{ type: 'message', payload: { ...message } }

// Пользователь печатает
{ type: 'typing', payload: { chatId, userId } }

// Статус пользователя
{ type: 'status', payload: { userId, isOnline } }

// Реакция
{ type: 'reaction', payload: { messageId, chatId, emoji, userId } }

// Звонок
{ type: 'call', payload: { chatId, callType, action, callerId, callerName } }
```

## 📁 Структура проекта

```
pipipupu-messenger/
├── server.js           # Основной файл сервера
├── index.html          # Frontend приложение
├── package.json        # Зависимости Node.js
├── README.md          # Документация
└── uploads/           # Загруженные файлы (создается автоматически)
```

## 🔒 Безопасность

⚠️ **Важно для продакшена:**

1. **Хеширование паролей:** Сейчас пароли хранятся в открытом виде. Используйте `bcrypt`:
```javascript
const bcrypt = require('bcrypt');
const hashedPassword = await bcrypt.hash(password, 10);
```

2. **Переменные окружения:** Используйте `.env` файл для секретов:
```bash
npm install dotenv
```

3. **HTTPS:** На Railway SSL включен автоматически

4. **Валидация данных:** Добавьте библиотеку валидации (например, `joi`)

5. **Rate Limiting:** Защита от DDoS атак

## 🎯 Roadmap

- [ ] Добавить базу данных (PostgreSQL/MongoDB)
- [ ] Реальная интеграция WebRTC для звонков
- [ ] Групповые чаты
- [ ] Пересылка сообщений
- [ ] Редактирование и удаление сообщений
- [ ] Голосовые сообщения
- [ ] Стикеры и GIF
- [ ] Push-уведомления
- [ ] E2E шифрование

## 🤝 Вклад

Вклад приветствуется! Создавайте Pull Request'ы.

## 📄 Лицензия

MIT License - используйте как хотите!

## 💡 Поддержка

Если возникли вопросы:
- Создайте Issue в GitHub
- Напишите в чате приложения 😉

---

**Сделано с ❤️ командой PipiPupu**

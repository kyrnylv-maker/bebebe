# 📘 Полное руководство - PipiPupu Messenger

## 🎯 Содержание

1. [Введение](#введение)
2. [Архитектура](#архитектура)
3. [Установка](#установка)
4. [Использование](#использование)
5. [API документация](#api-документация)
6. [Разработка](#разработка)
7. [Деплой](#деплой)
8. [FAQ](#faq)

---

## 📖 Введение

PipiPupu Messenger - это полнофункциональный клон Telegram Web, созданный с нуля на чистом JavaScript без использования фреймворков.

### Ключевые возможности

✅ **Real-time сообщения** через WebSocket  
✅ **Аутентификация** с JWT токенами  
✅ **Чаты и каналы** с разными правами доступа  
✅ **Загрузка файлов** (изображения, документы)  
✅ **Реакции на сообщения** с эмодзи  
✅ **Звонки** (UI готов для WebRTC)  
✅ **Темная и светлая темы**  
✅ **Адаптивный дизайн** (desktop + mobile)  

### Технологический стек

**Backend:**
- Node.js + Express
- WebSocket (ws)
- JWT для аутентификации
- Multer для загрузки файлов

**Frontend:**
- Vanilla JavaScript (ES6+)
- Tailwind CSS
- WebSocket API

**Деплой:**
- Railway (рекомендуется)
- Heroku, VPS, Docker

---

## 🏗 Архитектура

### Структура проекта

```
pipipupu-messenger/
├── server.js              # Основной сервер (Express + WebSocket)
├── index.html             # Frontend приложение (SPA)
├── test-api.html          # Инструмент тестирования API
├── package.json           # Зависимости Node.js
├── uploads/               # Загруженные файлы
│   └── .gitkeep
├── start.sh               # Скрипт запуска (Unix)
├── start.bat              # Скрипт запуска (Windows)
├── README.md              # Основная документация
├── DEPLOY.md              # Руководство по деплою
├── API_EXAMPLES.md        # Примеры API запросов
├── QUICKSTART.md          # Быстрый старт
├── COMPLETE_GUIDE.md      # Это руководство
├── .gitignore             # Игнорируемые файлы
├── .env.example           # Пример переменных окружения
└── railway.json           # Конфигурация Railway
```

### Поток данных

```
┌─────────────┐         HTTP/WS         ┌─────────────┐
│   Browser   │ ◄──────────────────────► │   Server    │
│  (Frontend) │                          │  (Backend)  │
└─────────────┘                          └─────────────┘
      │                                         │
      │                                         │
      ▼                                         ▼
  WebSocket                              In-Memory DB
  Connection                            ┌──────────────┐
                                        │ Users        │
                                        │ Chats        │
                                        │ Messages     │
                                        │ Channels     │
                                        └──────────────┘
```

### База данных (In-Memory)

Текущая версия использует оперативную память для хранения данных:

```javascript
const db = {
    users: new Map(),      // userId -> user объект
    chats: new Map(),      // chatId -> chat объект
    messages: new Map(),   // chatId -> массив сообщений
    channels: new Map(),   // channelId -> channel объект
    userSessions: new Map() // userId -> WebSocket connection
};
```

⚠️ **Важно:** Данные теряются при перезапуске сервера. Для продакшена рекомендуется использовать PostgreSQL или MongoDB.

---

## 🚀 Установка

### Системные требования

- **Node.js** 16.0 или выше
- **npm** (устанавливается вместе с Node.js)
- **Git** (опционально)

### Шаг 1: Установка Node.js

#### Windows
1. Скачайте установщик с https://nodejs.org/
2. Запустите установщик
3. Следуйте инструкциям (оставьте настройки по умолчанию)
4. Проверьте установку:
   ```bash
   node -v
   npm -v
   ```

#### macOS
```bash
# Через Homebrew
brew install node

# Проверка
node -v
npm -v
```

#### Linux (Ubuntu/Debian)
```bash
# Установка Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка
node -v
npm -v
```

### Шаг 2: Загрузка проекта

```bash
# Вариант 1: Клонирование из Git
git clone https://github.com/YOUR_USERNAME/pipipupu-messenger.git
cd pipipupu-messenger

# Вариант 2: Скачать ZIP и распаковать
# Затем перейти в папку проекта
```

### Шаг 3: Установка зависимостей

```bash
npm install
```

Это установит:
- express (веб-сервер)
- ws (WebSocket)
- cors (разрешение CORS)
- jsonwebtoken (JWT токены)
- multer (загрузка файлов)

### Шаг 4: Создание .env файла (опционально)

```bash
# Скопируйте пример
cp .env.example .env

# Отредактируйте .env
nano .env
```

Содержимое `.env`:
```env
PORT=3000
JWT_SECRET=измените-это-на-безопасный-ключ
NODE_ENV=development
```

### Шаг 5: Запуск

```bash
# Стандартный запуск
npm start

# Режим разработки (с автоперезагрузкой)
npm run dev

# Или используйте скрипты быстрого запуска
# Windows:
start.bat

# Linux/Mac:
./start.sh
```

Сервер запустится на http://localhost:3000

---

## 💻 Использование

### Первый запуск

1. **Откройте браузер**: http://localhost:3000
2. **Войдите** с демо-аккаунтом:
   - Username: `demo`
   - Password: `demo123`

### Регистрация нового пользователя

1. Нажмите **"Регистрация"**
2. Введите:
   - Username (уникальный)
   - Password
   - Email (опционально)
3. Нажмите **"Зарегистрироваться"**

### Настройка профиля

1. Нажмите ⚙️ в левом верхнем углу
2. Загрузите аватар (кнопка "Загрузить аватар")
3. Измените username
4. Добавьте биографию
5. Нажмите **"Сохранить"**

### Отправка сообщений

1. **Выберите чат** из списка слева
2. **Введите текст** в поле внизу
3. **Нажмите Enter** или кнопку ➤

#### Добавление эмодзи
- Нажмите 😊 рядом с полем ввода
- Выберите эмодзи из списка

#### Отправка файлов
- Нажмите 📎
- Выберите файл (изображение, документ)
- Файл автоматически загрузится
- Нажмите ➤ для отправки

#### Реакции на сообщения
- Нажмите "Добавить реакцию" под сообщением
- Выберите эмодзи
- Реакция добавится мгновенно

### Создание канала

1. Нажмите **"+ Создать канал"**
2. Введите название
3. Добавьте описание (опционально)
4. Нажмите **"Создать"**

**Особенности каналов:**
- Только админ (создатель) может отправлять сообщения
- Все участники могут читать
- Подписка автоматическая при создании

### Звонки

1. Откройте чат
2. Нажмите:
   - 📞 для аудио звонка
   - 📹 для видео звонка
3. Управление звонком:
   - 🔇 отключить микрофон
   - 📵 завершить звонок

### Переключение темы

- Нажмите 🌙 (светлая тема) или ☀️ (темная тема)
- Тема сохраняется в localStorage

### Поиск

- Используйте поле поиска вверху списка чатов
- Поиск работает по названиям чатов/каналов

### Вкладки

Переключайтесь между:
- **Все** - все чаты и каналы
- **Чаты** - только личные чаты
- **Каналы** - только каналы

---

## 📡 API Документация

### Авторизация

#### POST /auth/register
Регистрация нового пользователя

**Запрос:**
```json
{
  "username": "newuser",
  "password": "password123",
  "email": "user@example.com"
}
```

**Ответ:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "newuser",
    "email": "user@example.com",
    "bio": "",
    "avatar": null
  }
}
```

#### POST /auth/login
Вход в систему

**Запрос:**
```json
{
  "username": "demo",
  "password": "demo123"
}
```

**Ответ:** аналогично /auth/register

### Пользователи

#### GET /users/me
Получить информацию о текущем пользователе

**Headers:** `Authorization: Bearer {token}`

**Ответ:**
```json
{
  "id": "user_id",
  "username": "demo",
  "email": "demo@example.com",
  "bio": "My bio",
  "avatar": "url_to_avatar"
}
```

#### PATCH /users/me
Обновить профиль

**Headers:** `Authorization: Bearer {token}`

**Запрос:**
```json
{
  "username": "newname",
  "bio": "New bio",
  "avatar": "url_to_avatar"
}
```

### Чаты

#### GET /chats
Получить список чатов

**Headers:** `Authorization: Bearer {token}`

**Ответ:**
```json
[
  {
    "id": "chat_id",
    "name": "alice",
    "avatar": null,
    "isChannel": false,
    "isOnline": true,
    "lastMessage": {
      "text": "Last message text",
      "time": "14:30"
    }
  }
]
```

#### POST /chats
Создать новый чат

**Headers:** `Authorization: Bearer {token}`

**Запрос:**
```json
{
  "participantId": "other_user_id"
}
```

#### GET /chats/:chatId/messages
Получить сообщения чата

**Headers:** `Authorization: Bearer {token}`

**Ответ:**
```json
[
  {
    "id": "msg_id",
    "chatId": "chat_id",
    "senderId": "user_id",
    "senderName": "username",
    "text": "Message text",
    "file": null,
    "timestamp": "2024-01-20T14:30:00.000Z",
    "reactions": {
      "👍": ["user_id1", "user_id2"]
    }
  }
]
```

### Каналы

#### POST /channels
Создать канал

**Headers:** `Authorization: Bearer {token}`

**Запрос:**
```json
{
  "name": "My Channel",
  "description": "Channel description"
}
```

#### POST /channels/:channelId/subscribe
Подписаться на канал

**Headers:** `Authorization: Bearer {token}`

### Файлы

#### POST /upload
Загрузить файл

**Headers:** `Authorization: Bearer {token}`

**Content-Type:** `multipart/form-data`

**Body:** FormData с полем `file`

**Ответ:**
```json
{
  "url": "http://server/uploads/filename.jpg",
  "filename": "filename.jpg",
  "originalName": "original.jpg",
  "size": 123456,
  "mimeType": "image/jpeg"
}
```

### WebSocket

#### Подключение
```javascript
const ws = new WebSocket('ws://localhost:3000');
```

#### Аутентификация
```json
{
  "type": "auth",
  "token": "jwt_token"
}
```

#### События (Client → Server)

**Отправка сообщения:**
```json
{
  "type": "message",
  "payload": {
    "chatId": "chat_id",
    "text": "Message text",
    "file": null
  }
}
```

**Индикатор печати:**
```json
{
  "type": "typing",
  "payload": {
    "chatId": "chat_id"
  }
}
```

**Реакция:**
```json
{
  "type": "reaction",
  "payload": {
    "messageId": "msg_id",
    "chatId": "chat_id",
    "emoji": "👍"
  }
}
```

**Звонок:**
```json
{
  "type": "call",
  "payload": {
    "chatId": "chat_id",
    "callType": "video",
    "action": "start"
  }
}
```

#### События (Server → Client)

Сервер отправляет те же типы событий обратно клиенту.

---

## 🛠 Разработка

### Структура кода

#### Frontend (index.html)

Приложение организовано как Single Page Application (SPA):

```javascript
const app = {
    // Переменные состояния
    token: null,
    currentUser: null,
    currentChat: null,
    chats: [],
    messages: {},
    ws: null,
    
    // Методы
    init() { },              // Инициализация
    login() { },             // Вход
    register() { },          // Регистрация
    loadChats() { },         // Загрузка чатов
    openChat(chatId) { },    // Открытие чата
    sendMessage() { },       // Отправка сообщения
    // ... и т.д.
};
```

#### Backend (server.js)

Сервер организован модульно:

```javascript
// Express приложение
const app = express();

// WebSocket сервер
const wss = new WebSocket.Server({ server });

// In-memory база данных
const db = {
    users: new Map(),
    chats: new Map(),
    messages: new Map(),
    channels: new Map()
};

// REST API роуты
app.post('/auth/login', ...)
app.get('/chats', ...)

// WebSocket обработчики
wss.on('connection', (ws) => {
    ws.on('message', handleWebSocketMessage);
});
```

### Добавление новых функций

#### Пример: Добавление "прочитано"

**1. Обновите структуру сообщения:**

```javascript
// server.js
const message = {
    id: messageId,
    chatId,
    senderId: ws.userId,
    senderName: user?.username,
    text,
    file,
    timestamp: new Date().toISOString(),
    reactions: {},
    read: false  // ← новое поле
};
```

**2. Добавьте API endpoint:**

```javascript
app.post('/chats/:chatId/messages/:messageId/read', authenticate, (req, res) => {
    const { chatId, messageId } = req.params;
    const messages = db.messages.get(chatId);
    const message = messages?.find(m => m.id === messageId);
    
    if (message) {
        message.read = true;
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Message not found' });
    }
});
```

**3. Обновите frontend:**

```javascript
// index.html
async function markAsRead(messageId) {
    await app.apiCall(`/chats/${app.currentChat.id}/messages/${messageId}/read`, {
        method: 'POST'
    });
}
```

### Тестирование

#### Ручное тестирование
1. Откройте http://localhost:3000/test-api.html
2. Используйте встроенные тесты API
3. Проверьте WebSocket соединение

#### Автоматическое тестирование (опционально)

Установите Jest:
```bash
npm install --save-dev jest supertest
```

Создайте тесты в `tests/`:
```javascript
// tests/auth.test.js
const request = require('supertest');
const { app } = require('../server');

describe('Auth API', () => {
    test('POST /auth/register', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                username: 'testuser',
                password: 'test123'
            });
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
});
```

Запуск:
```bash
npm test
```

### Отладка

#### Backend логи
```javascript
// Добавьте в server.js
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
```

#### WebSocket логи
```javascript
// В handleWebSocketMessage
console.log('WS Message:', data.type, data.payload);
```

#### Frontend логи
Откройте DevTools (F12) и смотрите Console

---

## 🚀 Деплой

См. подробное руководство в [DEPLOY.md](DEPLOY.md)

### Быстрый деплой на Railway

```bash
npm i -g @railway/cli
railway login
railway init
railway up
```

---

## ❓ FAQ

### Как добавить базу данных?

См. [DATABASE_INTEGRATION.md](DATABASE_INTEGRATION.md) (создайте этот файл отдельно)

Кратко:
```javascript
// Установите PostgreSQL
npm install pg

// Подключитесь
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Используйте вместо Map
app.get('/users/me', async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [req.userId]
    );
    res.json(result.rows[0]);
});
```

### Как добавить хеширование паролей?

```javascript
// Установите bcrypt
npm install bcrypt

// В server.js
const bcrypt = require('bcrypt');

// При регистрации
const hashedPassword = await bcrypt.hash(password, 10);

// При входе
const isValid = await bcrypt.compare(password, user.password);
```

### Как добавить групповые чаты?

Обновите структуру чата:
```javascript
const chat = {
    id: chatId,
    participants: [userId1, userId2, userId3], // много участников
    isChannel: false,
    isGroup: true,  // новое поле
    name: 'Group name',
    admin: userId1
};
```

### Как добавить пересылку сообщений?

```javascript
// Frontend
function forwardMessage(messageId, targetChatId) {
    const message = findMessage(messageId);
    app.ws.send(JSON.stringify({
        type: 'message',
        payload: {
            chatId: targetChatId,
            text: message.text,
            file: message.file,
            forwarded: true,
            originalSender: message.senderName
        }
    }));
}
```

### Почему WebSocket не работает на HTTPS?

Используйте `wss://` вместо `ws://`:
```javascript
const WS_URL = window.location.protocol === 'https:' 
    ? 'wss://your-domain.com' 
    : 'ws://localhost:3000';
```

### Как настроить CORS?

```javascript
// server.js
app.use(cors({
    origin: ['https://your-frontend.com'],
    credentials: true
}));
```

---

## 📚 Дополнительные ресурсы

- [Node.js документация](https://nodejs.org/docs)
- [Express документация](https://expressjs.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [JWT.io](https://jwt.io/)
- [Railway документация](https://docs.railway.app/)

---

## 🤝 Поддержка

- **GitHub Issues**: создайте issue для багов
- **Email**: support@pipipupu.com (если создадите)
- **Telegram**: @pipipupu_support (если создадите)

---

## 📄 Лицензия

MIT License - свободное использование!

---

**Сделано с ❤️ для сообщества разработчиков**

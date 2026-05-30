# 📡 API Examples - PipiPupu Messenger

Примеры запросов к API для тестирования и интеграции.

## 🔐 Авторизация

### Регистрация

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123",
    "email": "test@example.com"
  }'
```

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc123",
    "username": "testuser",
    "email": "test@example.com",
    "bio": "",
    "avatar": null
  }
}
```

### Вход

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo",
    "password": "demo123"
  }'
```

**Ответ:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "abc123",
    "username": "demo",
    "email": "demo@pipipupu.com",
    "bio": "Демо-пользователь PipiPupu",
    "avatar": null
  }
}
```

---

## 👤 Пользователи

### Получить текущего пользователя

```bash
curl -X GET http://localhost:3000/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Ответ:**
```json
{
  "id": "abc123",
  "username": "demo",
  "email": "demo@pipipupu.com",
  "bio": "Демо-пользователь PipiPupu",
  "avatar": null
}
```

### Обновить профиль

```bash
curl -X PATCH http://localhost:3000/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newusername",
    "bio": "Моя новая биография 🚀",
    "avatar": "http://example.com/avatar.jpg"
  }'
```

**Ответ:**
```json
{
  "id": "abc123",
  "username": "newusername",
  "email": "demo@pipipupu.com",
  "bio": "Моя новая биография 🚀",
  "avatar": "http://example.com/avatar.jpg"
}
```

---

## 💬 Чаты

### Получить список чатов

```bash
curl -X GET http://localhost:3000/chats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Ответ:**
```json
[
  {
    "id": "chat123",
    "name": "alice",
    "avatar": null,
    "isChannel": false,
    "isOnline": true,
    "lastMessage": {
      "text": "Привет! Как дела? 👋",
      "time": "14:30"
    }
  },
  {
    "id": "channel123",
    "name": "PipiPupu News",
    "avatar": null,
    "isChannel": true,
    "isOnline": false,
    "lastMessage": {
      "text": "Добро пожаловать в PipiPupu Messenger! 🎉",
      "time": "12:00"
    }
  }
]
```

### Создать чат

```bash
curl -X POST http://localhost:3000/chats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "user456"
  }'
```

**Ответ:**
```json
{
  "chatId": "chat789"
}
```

### Получить сообщения чата

```bash
curl -X GET http://localhost:3000/chats/chat123/messages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Ответ:**
```json
[
  {
    "id": "msg1",
    "chatId": "chat123",
    "senderId": "user456",
    "senderName": "alice",
    "text": "Привет! Как дела? 👋",
    "file": null,
    "timestamp": "2024-01-20T14:30:00.000Z",
    "reactions": {}
  },
  {
    "id": "msg2",
    "chatId": "chat123",
    "senderId": "user456",
    "senderName": "alice",
    "text": "Этот мессенджер выглядит круто! 🚀",
    "file": null,
    "timestamp": "2024-01-20T15:00:00.000Z",
    "reactions": {
      "👍": ["abc123"],
      "🔥": ["abc123"]
    }
  }
]
```

---

## 📢 Каналы

### Создать канал

```bash
curl -X POST http://localhost:3000/channels \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Мой канал",
    "description": "Описание моего канала"
  }'
```

**Ответ:**
```json
{
  "channelId": "channel789",
  "channel": {
    "id": "channel789",
    "name": "Мой канал",
    "description": "Описание моего канала",
    "adminId": "abc123",
    "subscribers": ["abc123"],
    "isChannel": true,
    "createdAt": "2024-01-20T16:00:00.000Z"
  }
}
```

### Подписаться на канал

```bash
curl -X POST http://localhost:3000/channels/channel123/subscribe \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Ответ:**
```json
{
  "success": true
}
```

---

## 📎 Загрузка файлов

### Загрузить файл

```bash
curl -X POST http://localhost:3000/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/file.jpg"
```

**Ответ:**
```json
{
  "url": "http://localhost:3000/uploads/1234567890-file.jpg",
  "filename": "1234567890-file.jpg",
  "originalName": "file.jpg",
  "size": 123456,
  "mimeType": "image/jpeg"
}
```

### Пример загрузки с JavaScript

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:3000/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('File uploaded:', data.url);
});
```

---

## 🔌 WebSocket

### Подключение

```javascript
const ws = new WebSocket('ws://localhost:3000');

ws.onopen = () => {
  console.log('WebSocket connected');
  
  // Аутентификация
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_TOKEN_HERE'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Message received:', data);
};
```

### Отправка сообщения

```javascript
ws.send(JSON.stringify({
  type: 'message',
  payload: {
    chatId: 'chat123',
    text: 'Привет! 👋',
    file: null
  }
}));
```

### Отправка сообщения с файлом

```javascript
// Сначала загрузите файл через /upload
const fileData = await uploadFile(file);

// Затем отправьте сообщение с файлом
ws.send(JSON.stringify({
  type: 'message',
  payload: {
    chatId: 'chat123',
    text: 'Смотри какое фото!',
    file: {
      url: fileData.url,
      name: fileData.originalName,
      type: fileData.mimeType,
      size: fileData.size
    }
  }
}));
```

### Индикатор печати

```javascript
ws.send(JSON.stringify({
  type: 'typing',
  payload: {
    chatId: 'chat123'
  }
}));
```

### Реакция на сообщение

```javascript
ws.send(JSON.stringify({
  type: 'reaction',
  payload: {
    messageId: 'msg123',
    chatId: 'chat123',
    emoji: '❤️'
  }
}));
```

### Звонок

```javascript
// Начать звонок
ws.send(JSON.stringify({
  type: 'call',
  payload: {
    chatId: 'chat123',
    callType: 'video', // или 'audio'
    action: 'start'
  }
}));

// Завершить звонок
ws.send(JSON.stringify({
  type: 'call',
  payload: {
    chatId: 'chat123',
    action: 'end'
  }
}));
```

### Получение событий

```javascript
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'auth':
      console.log('Authenticated:', data.success);
      break;
      
    case 'message':
      console.log('New message:', data.payload);
      // data.payload содержит объект сообщения
      break;
      
    case 'typing':
      console.log('User typing:', data.payload);
      // data.payload: { chatId, userId }
      break;
      
    case 'status':
      console.log('User status changed:', data.payload);
      // data.payload: { userId, isOnline }
      break;
      
    case 'reaction':
      console.log('Reaction added:', data.payload);
      // data.payload: { messageId, chatId, emoji, userId }
      break;
      
    case 'call':
      console.log('Call event:', data.payload);
      // data.payload: { chatId, callType, action, callerId, callerName }
      break;
      
    case 'error':
      console.error('Error:', data.message);
      break;
  }
};
```

---

## 🧪 Тестирование с Postman

### 1. Создайте окружение (Environment)

Создайте переменные:
- `base_url`: `http://localhost:3000`
- `token`: (будет заполнено после логина)

### 2. Импортируйте коллекцию

Создайте новую коллекцию "PipiPupu API" и добавьте запросы выше.

### 3. Автоматическое сохранение токена

В тесте для запроса `/auth/login` добавьте:

```javascript
pm.test("Save token", function () {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
});
```

### 4. Используйте токен

В Headers всех защищенных запросов:
```
Authorization: Bearer {{token}}
```

---

## 🐍 Python примеры

### Регистрация

```python
import requests

response = requests.post(
    'http://localhost:3000/auth/register',
    json={
        'username': 'pythonuser',
        'password': 'password123',
        'email': 'python@example.com'
    }
)

data = response.json()
token = data['token']
print(f"Token: {token}")
```

### Получение чатов

```python
import requests

headers = {
    'Authorization': f'Bearer {token}'
}

response = requests.get(
    'http://localhost:3000/chats',
    headers=headers
)

chats = response.json()
print(f"Chats: {chats}")
```

### WebSocket (с библиотекой websockets)

```python
import asyncio
import websockets
import json

async def connect():
    uri = "ws://localhost:3000"
    async with websockets.connect(uri) as websocket:
        # Аутентификация
        await websocket.send(json.dumps({
            'type': 'auth',
            'token': token
        }))
        
        # Отправка сообщения
        await websocket.send(json.dumps({
            'type': 'message',
            'payload': {
                'chatId': 'chat123',
                'text': 'Привет из Python!'
            }
        }))
        
        # Получение сообщений
        while True:
            message = await websocket.recv()
            data = json.loads(message)
            print(f"Received: {data}")

asyncio.run(connect())
```

---

## 📊 Проверка здоровья сервера

```bash
curl http://localhost:3000/health
```

**Ответ:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T16:30:00.000Z",
  "users": 3,
  "chats": 3,
  "channels": 1,
  "activeConnections": 2
}
```

---

## 🔍 Отладка

### Просмотр всех пользователей (только для разработки)

Добавьте в `server.js`:

```javascript
app.get('/debug/users', (req, res) => {
  const users = Array.from(db.users.values()).map(u => ({
    id: u.id,
    username: u.username,
    isOnline: u.isOnline
  }));
  res.json(users);
});
```

### Просмотр всех чатов

```javascript
app.get('/debug/chats', (req, res) => {
  const chats = Array.from(db.chats.values());
  res.json(chats);
});
```

---

## 💡 Советы

1. **Сохраняйте токен** после логина для последующих запросов
2. **Проверяйте статус коды**: 200 (OK), 401 (Unauthorized), 404 (Not Found)
3. **Используйте WebSocket** для real-time функциональности
4. **Загружайте файлы** перед отправкой сообщения с файлом
5. **Обрабатывайте ошибки** в production коде

---

**Happy Coding! 🚀**

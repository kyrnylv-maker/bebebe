# 🚂 Railway Setup - PipiPupu Messenger

## ✅ Ваш URL на Railway

**Public URL:** https://bebebe-production-ac07.up.railway.app  
**Private URL:** bebebe.railway.internal

---

## 🚀 Быстрый деплой

### Вариант 1: Через GitHub (Рекомендуется)

1. **Создайте репозиторий на GitHub:**
```bash
git init
git add .
git commit -m "Initial commit: PipiPupu Messenger"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pipipupu.git
git push -u origin main
```

2. **Зайдите на Railway:**
   - Откройте https://railway.app
   - Войдите через GitHub

3. **Создайте новый проект:**
   - Нажмите **"New Project"**
   - Выберите **"Deploy from GitHub repo"**
   - Выберите ваш репозиторий
   - Railway автоматически определит Node.js

4. **Настройте переменные окружения:**
   - Откройте проект в Railway
   - Перейдите в **Variables**
   - Добавьте:
     ```
     JWT_SECRET=pipipupu-secret-key-change-in-production-2024
     PORT=3000
     NODE_ENV=production
     ```

5. **Дождитесь деплоя:**
   - Railway автоматически:
     - Установит зависимости (`npm install`)
     - Запустит сервер (`node server.js`)
     - Создаст публичный URL

6. **Откройте приложение:**
   ```
   https://bebebe-production-ac07.up.railway.app
   ```

---

### Вариант 2: Через Railway CLI

1. **Установите Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Войдите в аккаунт:**
```bash
railway login
```

3. **Свяжите с проектом:**
```bash
railway link
```

4. **Установите переменные:**
```bash
railway variables set JWT_SECRET=pipipupu-secret-key-2024
railway variables set PORT=3000
railway variables set NODE_ENV=production
```

5. **Деплой:**
```bash
railway up
```

6. **Откройте приложение:**
```bash
railway open
```

---

## 🔧 Настройка

### Переменные окружения в Railway

Обязательные:
```
JWT_SECRET=ваш-супер-секретный-ключ-измените-обязательно
```

Опциональные:
```
PORT=3000
NODE_ENV=production
```

### Как добавить переменные в Railway:

1. Откройте проект на https://railway.app
2. Перейдите в раздел **Variables**
3. Нажмите **New Variable**
4. Введите имя и значение
5. Нажмите **Add**

---

## 📡 Проверка работы

### 1. Проверка здоровья сервера

```bash
curl https://bebebe-production-ac07.up.railway.app/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "2024-01-20T10:00:00.000Z",
  "users": 3,
  "chats": 3,
  "channels": 1,
  "activeConnections": 0
}
```

### 2. Тест авторизации

```bash
curl -X POST https://bebebe-production-ac07.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","password":"demo123"}'
```

Должен вернуть токен.

### 3. Откройте в браузере

```
https://bebebe-production-ac07.up.railway.app
```

Войдите с **demo / demo123**

---

## 🔄 Обновление приложения

### Через Git (если используете GitHub):

```bash
# Внесите изменения в код
git add .
git commit -m "Update: описание изменений"
git push

# Railway автоматически задеплоит новую версию!
```

### Через Railway CLI:

```bash
# Внесите изменения в код
railway up
```

---

## 📊 Мониторинг

### Просмотр логов

**Через веб-интерфейс:**
1. Откройте проект на https://railway.app
2. Перейдите в раздел **Deployments**
3. Нажмите на активный деплой
4. Смотрите **Logs** в реальном времени

**Через CLI:**
```bash
railway logs
```

**С фильтром (последние 100 строк):**
```bash
railway logs --limit 100
```

**В реальном времени:**
```bash
railway logs -f
```

---

## 🐛 Решение проблем

### ❌ "Application failed to respond"

**Причина:** Сервер не запустился или упал

**Решение:**
1. Проверьте логи: `railway logs`
2. Убедитесь, что зависимости установлены
3. Проверьте переменные окружения
4. Попробуйте ручной редеплой

### ❌ "502 Bad Gateway"

**Причина:** Порт неправильно настроен

**Решение:**
```javascript
// В server.js убедитесь:
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
```

### ❌ "WebSocket connection failed"

**Причина:** Неправильный протокол

**Решение:** Убедитесь, что используется `wss://` (не `ws://`)
```javascript
const WS_URL = 'wss://bebebe-production-ac07.up.railway.app';
```

### ❌ "Upload failed" (файлы не загружаются)

**Причина:** Папка uploads не создана

**Решение:** В server.js уже есть автосоздание:
```javascript
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}
```

Но на Railway лучше использовать внешнее хранилище (AWS S3, Cloudinary)

---

## 🔒 Безопасность

### ⚠️ Обязательно измените JWT_SECRET!

**Плохо:**
```
JWT_SECRET=pipipupu-secret-key-2024
```

**Хорошо:**
```
JWT_SECRET=a8f5f167f44f4964e6c998dee827110c
```

**Генерация безопасного ключа:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Python
python -c "import secrets; print(secrets.token_hex(32))"
```

### 🔐 Дополнительные меры безопасности:

1. **Хеширование паролей** (добавьте bcrypt):
```bash
npm install bcrypt
```

2. **Rate Limiting** (защита от DDoS):
```bash
npm install express-rate-limit
```

3. **Helmet.js** (безопасность заголовков):
```bash
npm install helmet
```

4. **CORS настройка** (только для вашего домена):
```javascript
app.use(cors({
    origin: 'https://bebebe-production-ac07.up.railway.app'
}));
```

---

## 📈 Масштабирование

### Railway автоматически:
- ✅ Масштабирует по нагрузке
- ✅ Предоставляет SSL сертификаты
- ✅ Обеспечивает CDN
- ✅ Делает бэкапы

### Для больших нагрузок:

1. **Добавьте базу данных:**
   - Railway → Add Service → PostgreSQL
   - Используйте переменную `DATABASE_URL`

2. **Добавьте Redis для кэша:**
   - Railway → Add Service → Redis
   - Кэшируйте частые запросы

3. **Настройте PM2 Cluster:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'pipipupu',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster'
  }]
};
```

---

## 💾 База данных (Upgrade)

### Добавить PostgreSQL в Railway:

1. **В Railway проекте:**
   - Нажмите **New** → **Database** → **PostgreSQL**
   - Railway создаст базу и добавит переменную `DATABASE_URL`

2. **Установите драйвер:**
```bash
npm install pg
```

3. **Подключитесь в server.js:**
```javascript
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Используйте вместо Map
app.get('/users/me', authenticate, async (req, res) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [req.userId]
    );
    res.json(result.rows[0]);
});
```

4. **Создайте таблицы:**
```sql
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    bio TEXT,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chats (
    id VARCHAR(255) PRIMARY KEY,
    is_channel BOOLEAN DEFAULT FALSE,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id VARCHAR(255) PRIMARY KEY,
    chat_id VARCHAR(255) REFERENCES chats(id),
    sender_id VARCHAR(255) REFERENCES users(id),
    text TEXT,
    file_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🌐 Кастомный домен

### Подключить свой домен:

1. **В Railway:**
   - Settings → Domains
   - Нажмите **Custom Domain**
   - Введите ваш домен (например, `messenger.yourdomain.com`)

2. **В DNS провайдере:**
   - Добавьте CNAME запись:
     ```
     messenger.yourdomain.com → bebebe-production-ac07.up.railway.app
     ```

3. **Дождитесь распространения DNS** (5-30 минут)

4. **Обновите код:**
```javascript
const RAILWAY_URL = 'messenger.yourdomain.com';
```

Railway автоматически настроит SSL сертификат!

---

## 📞 Поддержка Railway

- **Документация:** https://docs.railway.app
- **Discord:** https://discord.gg/railway
- **Статус:** https://status.railway.app

---

## ✅ Чеклист успешного деплоя

- [ ] Проект загружен на GitHub
- [ ] Создан проект в Railway
- [ ] Установлены переменные окружения (JWT_SECRET)
- [ ] Деплой завершен успешно
- [ ] Приложение открывается в браузере
- [ ] Логин работает (demo/demo123)
- [ ] WebSocket подключается
- [ ] Сообщения отправляются
- [ ] Файлы загружаются
- [ ] SSL сертификат активен (https://)

---

## 🎉 Готово!

Ваше приложение запущено на:
```
https://bebebe-production-ac07.up.railway.app
```

**Демо-аккаунты:**
- demo / demo123
- alice / alice123
- bob / bob123

---

**Успешного запуска! 🚀**

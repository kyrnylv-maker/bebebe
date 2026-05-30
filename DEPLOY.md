# 🚀 Руководство по Деплою PipiPupu Messenger

## 📋 Содержание
1. [Локальный запуск](#локальный-запуск)
2. [Деплой на Railway](#деплой-на-railway)
3. [Деплой на Heroku](#деплой-на-heroku)
4. [Деплой на VPS](#деплой-на-vps)
5. [Docker](#docker)

---

## 🏠 Локальный запуск

### Windows

1. **Установите Node.js** (если еще не установлен):
   - Скачайте с https://nodejs.org/ (LTS версию)
   - Установите с настройками по умолчанию

2. **Запустите проект:**
   - Дважды кликните на `start.bat`
   - ИЛИ откройте командную строку и выполните:
   ```bash
   npm install
   npm start
   ```

3. **Откройте браузер:**
   ```
   http://localhost:3000
   ```

### Linux / macOS

1. **Установите Node.js:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # macOS (через Homebrew)
   brew install node
   ```

2. **Запустите проект:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

3. **Откройте браузер:**
   ```
   http://localhost:3000
   ```

---

## 🚂 Деплой на Railway

Railway - самый простой способ задеплоить приложение!

### Способ 1: Через GitHub (Рекомендуется)

1. **Создайте репозиторий на GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pipipupu.git
   git push -u origin main
   ```

2. **Зайдите на Railway:**
   - Откройте https://railway.app
   - Войдите через GitHub
   - Нажмите **"New Project"**

3. **Деплой:**
   - Выберите **"Deploy from GitHub repo"**
   - Выберите ваш репозиторий `pipipupu`
   - Railway автоматически определит Node.js проект
   - Дождитесь окончания деплоя (2-3 минуты)

4. **Настройте переменные окружения:**
   - Откройте проект в Railway
   - Перейдите в **Variables**
   - Добавьте:
     ```
     JWT_SECRET=ваш-супер-секретный-ключ-измените-меня
     ```

5. **Получите URL:**
   - В разделе **Settings** найдите **Domains**
   - Нажмите **Generate Domain**
   - Скопируйте URL (например: `pipipupu-production.up.railway.app`)

6. **Откройте приложение:**
   - Перейдите по полученному URL
   - Готово! 🎉

### Способ 2: Через Railway CLI

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

4. **Установите переменные:**
   ```bash
   railway variables set JWT_SECRET=ваш-секретный-ключ
   ```

5. **Задеплойте:**
   ```bash
   railway up
   ```

6. **Откройте приложение:**
   ```bash
   railway open
   ```

### Обновление на Railway

После изменений в коде:

```bash
git add .
git commit -m "Update: описание изменений"
git push
```

Railway автоматически задеплоит новую версию!

---

## 🟣 Деплой на Heroku

1. **Установите Heroku CLI:**
   ```bash
   # Windows (через установщик)
   # Скачайте с https://devcenter.heroku.com/articles/heroku-cli

   # macOS
   brew tap heroku/brew && brew install heroku

   # Linux
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Войдите в Heroku:**
   ```bash
   heroku login
   ```

3. **Создайте приложение:**
   ```bash
   heroku create pipipupu-messenger
   ```

4. **Установите переменные:**
   ```bash
   heroku config:set JWT_SECRET=ваш-секретный-ключ
   ```

5. **Задеплойте:**
   ```bash
   git push heroku main
   ```

6. **Откройте приложение:**
   ```bash
   heroku open
   ```

**Примечание:** Heroku требует Procfile:
```bash
echo "web: node server.js" > Procfile
git add Procfile
git commit -m "Add Procfile"
```

---

## 🖥 Деплой на VPS (Ubuntu)

### Подготовка сервера

1. **Подключитесь к серверу:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Обновите систему:**
   ```bash
   apt update && apt upgrade -y
   ```

3. **Установите Node.js:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
   apt install -y nodejs
   ```

4. **Установите PM2 (менеджер процессов):**
   ```bash
   npm install -g pm2
   ```

### Деплой приложения

1. **Клонируйте репозиторий:**
   ```bash
   cd /var/www
   git clone https://github.com/YOUR_USERNAME/pipipupu.git
   cd pipipupu
   ```

2. **Установите зависимости:**
   ```bash
   npm install --production
   ```

3. **Создайте .env файл:**
   ```bash
   nano .env
   ```
   
   Добавьте:
   ```env
   PORT=3000
   JWT_SECRET=ваш-супер-секретный-ключ
   NODE_ENV=production
   ```

4. **Запустите с PM2:**
   ```bash
   pm2 start server.js --name pipipupu
   pm2 save
   pm2 startup
   ```

### Настройка Nginx

1. **Установите Nginx:**
   ```bash
   apt install -y nginx
   ```

2. **Создайте конфигурацию:**
   ```bash
   nano /etc/nginx/sites-available/pipipupu
   ```

   Добавьте:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Активируйте конфигурацию:**
   ```bash
   ln -s /etc/nginx/sites-available/pipipupu /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

### SSL сертификат (Let's Encrypt)

1. **Установите Certbot:**
   ```bash
   apt install -y certbot python3-certbot-nginx
   ```

2. **Получите сертификат:**
   ```bash
   certbot --nginx -d your-domain.com
   ```

3. **Настройте автообновление:**
   ```bash
   certbot renew --dry-run
   ```

---

## 🐳 Docker

### Создайте Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
```

### Создайте docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - JWT_SECRET=change-me-in-production
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped
```

### Запуск

```bash
# Сборка
docker-compose build

# Запуск
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

---

## 🔧 Полезные команды

### Проверка логов (Railway)
```bash
railway logs
```

### Проверка логов (Heroku)
```bash
heroku logs --tail
```

### Проверка логов (PM2)
```bash
pm2 logs pipipupu
```

### Перезапуск (PM2)
```bash
pm2 restart pipipupu
```

### Мониторинг (PM2)
```bash
pm2 monit
```

---

## 🐛 Решение проблем

### WebSocket не работает
- Убедитесь, что используется `wss://` для HTTPS
- Проверьте настройки Nginx для WebSocket
- Добавьте заголовки в Nginx:
  ```nginx
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection 'upgrade';
  ```

### Загрузка файлов не работает
- Проверьте, что папка `uploads/` существует
- Убедитесь, что есть права на запись:
  ```bash
  chmod 755 uploads/
  ```

### Не подключается к базе данных
- Эта версия использует in-memory хранилище
- Для продакшена рекомендуется добавить PostgreSQL или MongoDB

---

## 📚 Дополнительно

### Мониторинг и аналитика
- Railway: встроенная аналитика
- PM2: `pm2 monit`
- New Relic, DataDog для production

### Резервное копирование
```bash
# Создать бэкап
tar -czf backup-$(date +%Y%m%d).tar.gz uploads/ server.js

# Восстановить
tar -xzf backup-20240101.tar.gz
```

### Масштабирование
- Railway: автомасштабирование в настройках
- PM2 Cluster Mode:
  ```bash
  pm2 start server.js -i max
  ```

---

## ✅ Чеклист перед продакшеном

- [ ] Изменен JWT_SECRET
- [ ] Включено хеширование паролей (bcrypt)
- [ ] Настроен HTTPS/SSL
- [ ] Добавлена база данных
- [ ] Настроен мониторинг
- [ ] Настроены резервные копии
- [ ] Добавлен rate limiting
- [ ] Настроены логи
- [ ] Проверена безопасность

---

**Удачного деплоя! 🚀**

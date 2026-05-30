import os
import sqlite3
from typing import Dict, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Bebebe Telegram Clone Backend")

# Настройка CORS, чтобы твой фронтенд мог стучаться к API с любого хоста
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "database.db"

# ================= ИНИЦИАЛИЗАЦИЯ БАЗЫ ДАННЫХ (SQLite) =================
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    # Таблица пользователей
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        bio TEXT DEFAULT ''
    )""")
    
    # Таблица чатов/каналов
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        type TEXT NOT NULL, -- 'chats' или 'channels'
        creator TEXT NOT NULL
    )""")
    
    # Таблица сообщений
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chat_id INTEGER NOT NULL,
        sender TEXT NOT NULL,
        text TEXT NOT NULL
    )""")
    
    # Создаем дефолтные чаты, если база пустая, чтобы юзер не видел белый экран
    cursor.execute("SELECT COUNT(*) FROM chats")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO chats (title, type, creator) VALUES (?, ?, ?)", ("Команда Бэкенда 🚀", "chats", "admin"))
        cursor.execute("INSERT INTO chats (title, type, creator) VALUES (?, ?, ?)", ("Новости Bebebe 📢", "channels", "admin"))
        cursor.execute("INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)", (1, "admin", "Добро пожаловать в общий чат!"))
        cursor.execute("INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)", (2, "admin", "Канал успешно запущен на Railway."))
        conn.commit()
        
    conn.close()

init_db()

# ================= PYDANTIC МОДЕЛИ =================
class UserAuth(BaseModel):
    username: str
    password: str

class ProfileUpdate(BaseModel):
    bio: str

class ChannelCreate(BaseModel):
    title: str

# ================= МЕНЕДЖЕР ВЕБСОКЕТОВ =================
class ConnectionManager:
    def __init__(self):
        # Храним активные соединения: { username: websocket }
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, username: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[username] = websocket

    def disconnect(self, username: str):
        if username in self.active_connections:
            del self.active_connections[username]

    async def broadcast(self, message: dict):
        # Рассылаем пакет всем подключенным клиентам, фронтенд сам отфильтрует по chat_id
        for connection in self.active_connections.values():
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# ================= ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (AUTH) =================
def get_user_from_token(authorization: str = None):
    """Простая и надежная валидация токенов без внешних зависимостей"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Отсутствует или неверный токен авторизации")
    
    token = authorization.split(" ")[1]
    username = token.replace("bebebe_secret_token_", "")
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, bio FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")
        
    return {"id": user[0], "username": user[1], "bio": user[2]}

# ================= REST API ЭНДПОИНТЫ =================

@app.post("/api/register")
def register(data: UserAuth):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (data.username, data.password))
        conn.commit()
        cursor.execute("SELECT id, username, bio FROM users WHERE username = ?", (data.username,))
        user = cursor.fetchone()
        conn.close()
        
        token = f"bebebe_secret_token_{data.username}"
        return {
            "token": token,
            "user": {"id": user[0], "username": user[1], "bio": user[2], "avatar": None}
        }
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Этот юзернейм уже занят")

@app.post("/api/login")
def login(data: UserAuth):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, bio FROM users WHERE username = ? AND password = ?", (data.username, data.password))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        raise HTTPException(status_code=400, detail="Неверный юзернейм или пароль")
        
    token = f"bebebe_secret_token_{data.username}"
    return {
        "token": token,
        "user": {"id": user[0], "username": user[1], "bio": user[2], "avatar": None}
    }

@app.get("/api/chats")
def get_chats(current_user: dict = Depends(get_user_from_token)):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, type, creator FROM chats")
    chats_rows = cursor.fetchall()
    
    result = []
    for row in chats_rows:
        chat_id, title, c_type, creator = row
        # Достаем последнее сообщение для этого чата
        cursor.execute("SELECT sender, text FROM messages WHERE chat_id = ? ORDER BY id DESC LIMIT 1", (chat_id,))
        last_msg_row = cursor.fetchone()
        last_msg = f"{last_msg_row[0]}: {last_msg_row[1]}" if last_msg_row else "Нет сообщений"
        
        result.append({
            "id": chat_id,
            "title": title,
            "type": c_type,
            "is_admin": creator == current_user["username"],
            "last_msg": last_msg
        })
    conn.close()
    return result

@app.get("/api/chats/{chat_id}/messages")
def get_messages(chat_id: int, current_user: dict = Depends(get_user_from_token)):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT sender, text FROM messages WHERE chat_id = ? ORDER BY id ASC", (chat_id,))
    messages_rows = cursor.fetchall()
    conn.close()
    
    return [{"sender": row[0], "text": row[1]} for row in messages_rows]

@app.post("/api/profile/update")
def update_profile(data: ProfileUpdate, current_user: dict = Depends(get_user_from_token)):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET bio = ? WHERE id = ?", (data.bio, current_user["id"]))
    conn.commit()
    conn.close()
    return {"status": "ok"}

@app.post("/api/channels/create")
def create_channel(data: ChannelCreate, current_user: dict = Depends(get_user_from_token)):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chats (title, type, creator) VALUES (?, 'channels', ?)", (data.title, current_user["username"]))
    conn.commit()
    conn.close()
    return {"status": "created"}

# ================= REAT-TIME WEBSOCKET ROUTER =================
@app.websocket("/ws")
def websocket_endpoint(websocket: WebSocket, token: str = None):
    if not token:
        return
        
    username = token.replace("bebebe_secret_token_", "")
    
    # Проверяем пользователя в бд перед подключением к сокету
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return

    # Подключаем к менеджеру реалтайма
    import asyncio
    asyncio.run(manager.connect(username, websocket))
    
    try:
        while True:
            # Ждем пакет от фронтенда
            data = asyncio.run(websocket.receive_json())
            
            # Обрабатываем отправку сообщения
            if data.get("action") == "send_message":
                chat_id = data.get("chat_id")
                text = data.get("text")
                
                if chat_id and text:
                    # Сохраняем в SQLite историю диалога
                    conn = sqlite3.connect(DB_FILE)
                    cursor = conn.cursor()
                    cursor.execute("INSERT INTO messages (chat_id, sender, text) VALUES (?, ?, ?)", (chat_id, username, text))
                    conn.commit()
                    conn.close()
                    
                    # Транслируем событие всем активным вкладкам мессенджера
                    asyncio.run(manager.broadcast({
                        "event": "new_message",
                        "chat_id": chat_id,
                        "sender": username,
                        "text": text
                    }))
    except WebSocketDisconnect:
        manager.disconnect(username)
    except Exception:
        manager.disconnect(username)
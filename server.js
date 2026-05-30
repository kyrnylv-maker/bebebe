const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'pipipupu-secret-key-2024';

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// In-memory database
const db = {
    users: new Map(),
    chats: new Map(),
    messages: new Map(),
    channels: new Map(),
    userSessions: new Map()
};

// Helper functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Middleware for authentication
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
    }

    req.userId = decoded.userId;
    next();
}

// Initialize default data
function initializeDefaultData() {
    // Create demo users
    const demoUser1 = {
        id: generateId(),
        username: 'demo',
        password: 'demo123',
        email: 'demo@pipipupu.com',
        bio: 'Демо-пользователь PipiPupu',
        avatar: null,
        createdAt: new Date().toISOString(),
        isOnline: false
    };

    const demoUser2 = {
        id: generateId(),
        username: 'alice',
        password: 'alice123',
        email: 'alice@pipipupu.com',
        bio: 'Привет! Я Алиса 👋',
        avatar: null,
        createdAt: new Date().toISOString(),
        isOnline: true
    };

    const demoUser3 = {
        id: generateId(),
        username: 'bob',
        password: 'bob123',
        email: 'bob@pipipupu.com',
        bio: 'Разработчик и любитель технологий 💻',
        avatar: null,
        createdAt: new Date().toISOString(),
        isOnline: false
    };

    db.users.set(demoUser1.id, demoUser1);
    db.users.set(demoUser2.id, demoUser2);
    db.users.set(demoUser3.id, demoUser3);

    // Create demo chat
    const chatId1 = generateId();
    db.chats.set(chatId1, {
        id: chatId1,
        participants: [demoUser1.id, demoUser2.id],
        isChannel: false,
        createdAt: new Date().toISOString()
    });

    const chatId2 = generateId();
    db.chats.set(chatId2, {
        id: chatId2,
        participants: [demoUser1.id, demoUser3.id],
        isChannel: false,
        createdAt: new Date().toISOString()
    });

    // Create demo channel
    const channelId = generateId();
    db.channels.set(channelId, {
        id: channelId,
        name: 'PipiPupu News',
        description: 'Официальный канал новостей',
        adminId: demoUser1.id,
        subscribers: [demoUser1.id, demoUser2.id, demoUser3.id],
        isChannel: true,
        createdAt: new Date().toISOString()
    });

    db.chats.set(channelId, {
        id: channelId,
        participants: [demoUser1.id, demoUser2.id, demoUser3.id],
        isChannel: true,
        adminId: demoUser1.id,
        name: 'PipiPupu News',
        description: 'Официальный канал новостей',
        createdAt: new Date().toISOString()
    });

    // Add demo messages
    const messages1 = [];
    messages1.push({
        id: generateId(),
        chatId: chatId1,
        senderId: demoUser2.id,
        senderName: 'alice',
        text: 'Привет! Как дела? 👋',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        reactions: {}
    });

    messages1.push({
        id: generateId(),
        chatId: chatId1,
        senderId: demoUser2.id,
        senderName: 'alice',
        text: 'Этот мессенджер выглядит круто! 🚀',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        reactions: { '👍': [demoUser1.id], '🔥': [demoUser1.id] }
    });

    db.messages.set(chatId1, messages1);

    const messages2 = [];
    messages2.push({
        id: generateId(),
        chatId: chatId2,
        senderId: demoUser3.id,
        senderName: 'bob',
        text: 'Проверка связи! Все работает? 📡',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        reactions: {}
    });

    db.messages.set(chatId2, messages2);

    const channelMessages = [];
    channelMessages.push({
        id: generateId(),
        chatId: channelId,
        senderId: demoUser1.id,
        senderName: 'demo',
        text: 'Добро пожаловать в PipiPupu Messenger! 🎉',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        reactions: { '❤️': [demoUser2.id, demoUser3.id] }
    });

    db.messages.set(channelId, channelMessages);

    console.log('✅ Default data initialized');
    console.log(`📝 Demo users: demo/demo123, alice/alice123, bob/bob123`);
}

initializeDefaultData();

// REST API Routes

// Auth Routes
app.post('/auth/register', (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check if user already exists
    const existingUser = Array.from(db.users.values()).find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const userId = generateId();
    const user = {
        id: userId,
        username,
        password, // In production, hash this!
        email: email || null,
        bio: '',
        avatar: null,
        createdAt: new Date().toISOString(),
        isOnline: true
    };

    db.users.set(userId, user);

    const token = generateToken(userId);
    res.json({ 
        token, 
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar
        }
    });
});

app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    const user = Array.from(db.users.values()).find(
        u => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.isOnline = true;
    const token = generateToken(user.id);
    
    res.json({ 
        token,
        user: {
            id: user.id,
            username: user.username,
            email: user.email,
            bio: user.bio,
            avatar: user.avatar
        }
    });
});

// User Routes
app.get('/users/me', authenticate, (req, res) => {
    const user = db.users.get(req.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar
    });
});

app.patch('/users/me', authenticate, (req, res) => {
    const user = db.users.get(req.userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    const { username, bio, avatar } = req.body;
    
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    db.users.set(req.userId, user);

    res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar
    });
});

// Chat Routes
app.get('/chats', authenticate, (req, res) => {
    const userChats = Array.from(db.chats.values())
        .filter(chat => chat.participants.includes(req.userId));

    const chatsWithDetails = userChats.map(chat => {
        const messages = db.messages.get(chat.id) || [];
        const lastMessage = messages[messages.length - 1];

        if (chat.isChannel) {
            return {
                id: chat.id,
                name: chat.name,
                avatar: null,
                isChannel: true,
                isOnline: false,
                lastMessage: lastMessage ? {
                    text: lastMessage.text,
                    time: new Date(lastMessage.timestamp).toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                } : null
            };
        }

        // Get other participant
        const otherUserId = chat.participants.find(id => id !== req.userId);
        const otherUser = db.users.get(otherUserId);

        return {
            id: chat.id,
            name: otherUser?.username || 'Unknown User',
            avatar: otherUser?.avatar || null,
            isChannel: false,
            isOnline: otherUser?.isOnline || false,
            lastMessage: lastMessage ? {
                text: lastMessage.text,
                time: new Date(lastMessage.timestamp).toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })
            } : null
        };
    });

    res.json(chatsWithDetails);
});

app.post('/chats', authenticate, (req, res) => {
    const { participantId } = req.body;

    if (!participantId) {
        return res.status(400).json({ error: 'Participant ID is required' });
    }

    // Check if chat already exists
    const existingChat = Array.from(db.chats.values()).find(
        chat => !chat.isChannel && 
                chat.participants.includes(req.userId) && 
                chat.participants.includes(participantId)
    );

    if (existingChat) {
        return res.json({ chatId: existingChat.id });
    }

    const chatId = generateId();
    const chat = {
        id: chatId,
        participants: [req.userId, participantId],
        isChannel: false,
        createdAt: new Date().toISOString()
    };

    db.chats.set(chatId, chat);
    db.messages.set(chatId, []);

    res.json({ chatId });
});

app.get('/chats/:chatId/messages', authenticate, (req, res) => {
    const { chatId } = req.params;
    const chat = db.chats.get(chatId);

    if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
    }

    if (!chat.participants.includes(req.userId)) {
        return res.status(403).json({ error: 'Access denied' });
    }

    const messages = db.messages.get(chatId) || [];
    res.json(messages);
});

// Channel Routes
app.post('/channels', authenticate, (req, res) => {
    const { name, description } = req.body;

    if (!name) {
        return res.status(400).json({ error: 'Channel name is required' });
    }

    const channelId = generateId();
    const channel = {
        id: channelId,
        name,
        description: description || '',
        adminId: req.userId,
        subscribers: [req.userId],
        isChannel: true,
        createdAt: new Date().toISOString()
    };

    db.channels.set(channelId, channel);
    db.chats.set(channelId, {
        id: channelId,
        participants: [req.userId],
        isChannel: true,
        adminId: req.userId,
        name,
        description: description || '',
        createdAt: new Date().toISOString()
    });
    db.messages.set(channelId, []);

    res.json({ channelId, channel });
});

app.post('/channels/:channelId/subscribe', authenticate, (req, res) => {
    const { channelId } = req.params;
    const channel = db.channels.get(channelId);

    if (!channel) {
        return res.status(404).json({ error: 'Channel not found' });
    }

    if (!channel.subscribers.includes(req.userId)) {
        channel.subscribers.push(req.userId);
        
        const chat = db.chats.get(channelId);
        if (chat && !chat.participants.includes(req.userId)) {
            chat.participants.push(req.userId);
        }
    }

    res.json({ success: true });
});

// File Upload Route
app.post('/upload', authenticate, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
        url: fileUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
    });
});

// WebSocket handling
const clients = new Map();

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleWebSocketMessage(ws, data);
        } catch (error) {
            console.error('WebSocket message error:', error);
        }
    });

    ws.on('close', () => {
        // Remove client and set user offline
        for (const [userId, client] of clients.entries()) {
            if (client === ws) {
                clients.delete(userId);
                const user = db.users.get(userId);
                if (user) {
                    user.isOnline = false;
                    broadcastUserStatus(userId, false);
                }
                break;
            }
        }
        console.log('WebSocket connection closed');
    });
});

function handleWebSocketMessage(ws, data) {
    switch (data.type) {
        case 'auth':
            handleAuth(ws, data);
            break;
        case 'message':
            handleMessage(ws, data);
            break;
        case 'typing':
            handleTyping(ws, data);
            break;
        case 'reaction':
            handleReaction(ws, data);
            break;
        case 'call':
            handleCall(ws, data);
            break;
    }
}

function handleAuth(ws, data) {
    const decoded = verifyToken(data.token);
    if (!decoded) {
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid token' }));
        return;
    }

    clients.set(decoded.userId, ws);
    ws.userId = decoded.userId;

    const user = db.users.get(decoded.userId);
    if (user) {
        user.isOnline = true;
        broadcastUserStatus(decoded.userId, true);
    }

    ws.send(JSON.stringify({ type: 'auth', success: true }));
}

function handleMessage(ws, data) {
    const { chatId, text, file } = data.payload;
    const chat = db.chats.get(chatId);

    if (!chat || !chat.participants.includes(ws.userId)) {
        return;
    }

    // Check if user can send messages (for channels, only admin)
    if (chat.isChannel && chat.adminId !== ws.userId) {
        ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Only admin can send messages in this channel' 
        }));
        return;
    }

    const user = db.users.get(ws.userId);
    const messageId = generateId();
    const message = {
        id: messageId,
        chatId,
        senderId: ws.userId,
        senderName: user?.username || 'Unknown',
        text: text || '',
        file: file || null,
        timestamp: new Date().toISOString(),
        reactions: {}
    };

    const messages = db.messages.get(chatId) || [];
    messages.push(message);
    db.messages.set(chatId, messages);

    // Broadcast to all participants
    chat.participants.forEach(participantId => {
        const client = clients.get(participantId);
        if (client && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
                type: 'message',
                payload: message
            }));
        }
    });
}

function handleTyping(ws, data) {
    const { chatId } = data.payload;
    const chat = db.chats.get(chatId);

    if (!chat || !chat.participants.includes(ws.userId)) {
        return;
    }

    // Broadcast typing to other participants
    chat.participants.forEach(participantId => {
        if (participantId !== ws.userId) {
            const client = clients.get(participantId);
            if (client && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'typing',
                    payload: {
                        chatId,
                        userId: ws.userId
                    }
                }));
            }
        }
    });
}

function handleReaction(ws, data) {
    const { messageId, chatId, emoji } = data.payload;
    const messages = db.messages.get(chatId);

    if (!messages) return;

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    if (!message.reactions) {
        message.reactions = {};
    }

    if (!message.reactions[emoji]) {
        message.reactions[emoji] = [];
    }

    const userIndex = message.reactions[emoji].indexOf(ws.userId);
    if (userIndex > -1) {
        message.reactions[emoji].splice(userIndex, 1);
        if (message.reactions[emoji].length === 0) {
            delete message.reactions[emoji];
        }
    } else {
        message.reactions[emoji].push(ws.userId);
    }

    // Broadcast reaction update
    const chat = db.chats.get(chatId);
    if (chat) {
        chat.participants.forEach(participantId => {
            const client = clients.get(participantId);
            if (client && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'reaction',
                    payload: {
                        messageId,
                        chatId,
                        emoji,
                        userId: ws.userId
                    }
                }));
            }
        });
    }
}

function handleCall(ws, data) {
    const { chatId, callType, action } = data.payload;
    const chat = db.chats.get(chatId);

    if (!chat || !chat.participants.includes(ws.userId)) {
        return;
    }

    const user = db.users.get(ws.userId);

    // Broadcast call to other participants
    chat.participants.forEach(participantId => {
        if (participantId !== ws.userId) {
            const client = clients.get(participantId);
            if (client && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: 'call',
                    payload: {
                        chatId,
                        callType,
                        action: action === 'start' ? 'incoming' : action,
                        callerId: ws.userId,
                        callerName: user?.username || 'Unknown'
                    }
                }));
            }
        }
    });
}

function broadcastUserStatus(userId, isOnline) {
    const userChats = Array.from(db.chats.values())
        .filter(chat => chat.participants.includes(userId));

    userChats.forEach(chat => {
        chat.participants.forEach(participantId => {
            if (participantId !== userId) {
                const client = clients.get(participantId);
                if (client && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({
                        type: 'status',
                        payload: {
                            userId,
                            isOnline
                        }
                    }));
                }
            }
        });
    });
}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        users: db.users.size,
        chats: db.chats.size,
        channels: db.channels.size,
        activeConnections: clients.size
    });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
    const isProduction = process.env.NODE_ENV === 'production';
    const serverUrl = isProduction 
        ? 'https://bebebe-production-ac07.up.railway.app'
        : `http://localhost:${PORT}`;
    
    console.log(`
╔═══════════════════════════════════════════╗
║   🚀 PipiPupu Messenger Server Running   ║
╠═══════════════════════════════════════════╣
║  Environment: ${process.env.NODE_ENV || 'development'}                     ║
║  Server URL: ${serverUrl.padEnd(28)} ║
║  Port: ${PORT}                                 ║
╠═══════════════════════════════════════════╣
║  📝 Demo Accounts:                        ║
║     demo/demo123                          ║
║     alice/alice123                        ║
║     bob/bob123                            ║
╠═══════════════════════════════════════════╣
║  💡 Status: http://localhost:${PORT}/health  ║
╚═══════════════════════════════════════════╝
    `);
});

module.exports = { app, server };
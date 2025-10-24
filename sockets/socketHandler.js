// socketHandlers.js
const { Message } = require('../models');

module.exports = (io) => {
    const onlineUsers = new Map();

    io.on('connection', (socket) => {
        console.log(`🟢 User connected: ${socket.id}`);

        // Track user online
        socket.on('userOnline', (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`  User online: ${userId} (${socket.id})`);
        });

        // ===== COMMUNITY CHAT =====
        socket.on('joinCommunity', (room = 'community') => {
            socket.join(room);
            console.log(`👥 User ${socket.id} joined community`);
        });

        socket.on('communityMessage', async ({ message, userInitial, userId }) => {
            try {
                const saved = await Message.create({
                    sender_id: userId || null,
                    receiver_id: null,
                    content: message,
                    message_type: 'text',
                    is_read: false,
                });

                const msgData = {
                    message: saved.content,
                    userInitial,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isSender: false,
                };

                socket.to('community').emit('receiveCommunityMessage', msgData);
            } catch (err) {
                console.error('    Error saving community message:', err);
            }
        });

        // ===== REGISTER PRIVATE CHAT & CALL SOCKETS =====
        const registerMessageHandlers = require('./messageSocket');
        const registerCallHandlers = require('./callSocket');

        registerMessageHandlers(io, socket, onlineUsers);
        registerCallHandlers(io, socket, onlineUsers);

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log(`🔴 User disconnected: ${socket.id}`);
            for (const [userId, sockId] of onlineUsers.entries()) {
                if (sockId === socket.id) onlineUsers.delete(userId);
            }
        });
    });
};

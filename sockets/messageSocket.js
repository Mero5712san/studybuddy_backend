// messageSocket.js
const { Message } = require('../models');

module.exports = (io, socket, onlineUsers) => {
    // Send a private message
    socket.on('send_message', async ({ sender_id, receiver_id, content, message_type }) => {
        try {
            if (!content?.trim()) return;

            const message = await Message.create({
                sender_id,
                receiver_id,
                content,
                message_type,
            });

            const receiverSocketId = onlineUsers.get(receiver_id);

            //   Emit to receiver only
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive_message', {
                    ...message.toJSON(),
                    isSender: false,
                });
            }

            //   Emit back to sender (for UI confirmation)
            socket.emit('message_sent', {
                ...message.toJSON(),
                isSender: true,
            });
        } catch (err) {
            console.error('Error sending message:', err);
        }
    });

    // Read receipt
    socket.on('read_message', async ({ message_id }) => {
        await Message.update({ is_read: true }, { where: { id: message_id } });
    });

    // Typing indicators
    socket.on('typing', ({ from, to }) => {
        const receiverSocketId = onlineUsers.get(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing', { from });
        }
    });

    socket.on('stop_typing', ({ from, to }) => {
        const receiverSocketId = onlineUsers.get(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('stop_typing', { from });
        }
    });
};

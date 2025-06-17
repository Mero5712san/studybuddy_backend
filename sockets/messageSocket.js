const { Message } = require('../models');

module.exports = (io, socket) => {
    // Send a message
    socket.on('send_message', async ({ sender_id, receiver_id, content, message_type }) => {
        const message = await Message.create({
            sender_id,
            receiver_id,
            content,
            message_type,
        });

        const receiverSocket = io.sockets.sockets.get(receiver_id);
        if (receiverSocket) {
            io.to(receiverSocket.id).emit(`receive_message_${receiver_id}`, message);
        }
    });

    // Read receipt
    socket.on('read_message', async ({ message_id }) => {
        await Message.update({ is_read: true }, { where: { id: message_id } });
    });

    // Typing indicators
    socket.on('typing', ({ from, to }) => {
        io.emit(`typing_${to}`, { from });
    });

    socket.on('stop_typing', ({ from, to }) => {
        io.emit(`stop_typing_${to}`, { from });
    });
};

const registerMessageHandlers = require('./messageSocket');
const registerCallHandlers = require('./callSocket');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`🟢 User connected: ${socket.id}`);

        registerMessageHandlers(io, socket);
        registerCallHandlers(io, socket);

        socket.on('disconnect', () => {
            console.log(`🔴 User disconnected: ${socket.id}`);
        });
    });
};

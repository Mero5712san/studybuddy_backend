// callSocket.js
const { Session, CallHistory } = require('../models');

module.exports = (io, socket, onlineUsers) => {
    // When call starts
    socket.on('start_call', async ({ session_id, from, to, link, call_type }) => {
        try {
            const receiverSocketId = onlineUsers.get(to);

            if (receiverSocketId) {
                io.to(receiverSocketId).emit('incoming_call', {
                    session_id,
                    from,
                    link,
                    call_type,
                });
            }

            await Session.update(
                { status: 'pending', meeting_link: link, call_type },
                { where: { id: session_id } }
            );
        } catch (err) {
            console.error('Error starting call:', err);
        }
    });

    // WebRTC Signal exchange
    socket.on('call_signal', ({ to, signalData }) => {
        const receiverSocketId = onlineUsers.get(to);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('call_signal', signalData);
        }
    });

    // End call
    socket.on('end_call', async ({ session_id, status, duration }) => {
        try {
            const endTime = new Date();

            await CallHistory.create({
                session_id,
                end_time: endTime,
                status,
                duration,
            });

            await Session.update({ status }, { where: { id: session_id } });

            io.emit('call_ended', { session_id, status });
        } catch (err) {
            console.error('Error ending call:', err);
        }
    });
};

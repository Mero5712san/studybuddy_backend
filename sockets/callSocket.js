const { Session, CallHistory } = require('../models');

module.exports = (io, socket) => {
    socket.on('start_call', async ({ session_id, from, to, link }) => {
        io.emit(`incoming_call_${to}`, { session_id, from, link });

        await Session.update(
            { status: 'pending', meeting_link: link },
            { where: { id: session_id } }
        );
    });

    socket.on('call_signal', ({ to, signalData }) => {
        io.emit(`call_signal_${to}`, signalData);
    });

    socket.on('end_call', async ({ session_id, status, duration }) => {
        const endTime = new Date();

        await CallHistory.create({
            session_id,
            end_time: endTime,
            status,
            duration,
        });

        await Session.update({ status }, { where: { id: session_id } });

        io.emit(`call_ended_${session_id}`, { session_id, status });
    });
};

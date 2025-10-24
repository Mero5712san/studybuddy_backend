require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const db = require('./models');
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"]
    }
});


require('./sockets/socketHandler')(io);

// db.sequelize.sync({ alter: true }).then(() => {
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// });

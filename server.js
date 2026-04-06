require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const db = require('./models');
const server = http.createServer(app);
const allowedOrigins = [
    'https://studybuddy-frontend-1i3l.vercel.app',
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173'
].filter(Boolean);

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST'],
        credentials: true,
    }
});


require('./sockets/socketHandler')(io);

// db.sequelize.sync({ alter: true }).then(() => {
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// });

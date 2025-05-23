const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const SocketService = require('./services/socketService');
const Meeting = require('./models/Meeting');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Initialize Socket.IO service
const socketService = new SocketService(io);
socketService.initialize();

// Socket.IO connection handling
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-meeting', async ({ meetingId }) => {
        try {
            // Create or update meeting in database
            let meeting = await Meeting.findOne({ meetingId });
            if (!meeting) {
                meeting = await Meeting.create({
                    meetingId,
                    host: socket.id,
                    participants: [{ userId: socket.id, joinedAt: new Date() }],
                });
            } else {
                await Meeting.updateOne(
                    { meetingId },
                    {
                        $push: {
                            participants: { userId: socket.id, joinedAt: new Date() },
                        },
                    }
                );
            }

            // Create room if it doesn't exist
            if (!rooms.has(meetingId)) {
                rooms.set(meetingId, new Set());
            }

            const room = rooms.get(meetingId);
            room.add(socket.id);

            // Notify others in the room
            socket.to(meetingId).emit('user-joined', {
                userId: socket.id,
                signal: null, // Signal will be handled by WebRTC
            });

            // Join the room
            socket.join(meetingId);
        } catch (error) {
            console.error('Error joining meeting:', error);
            socket.emit('error', { message: 'Failed to join meeting' });
        }
    });

    socket.on('return-signal', ({ signal, to }) => {
        io.to(to).emit('signal-received', {
            userId: socket.id,
            signal,
        });
    });

    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);

        // Find and clean up rooms
        rooms.forEach(async (participants, meetingId) => {
            if (participants.has(socket.id)) {
                participants.delete(socket.id);

                // Update meeting in database
                await Meeting.updateOne(
                    { meetingId },
                    {
                        $set: {
                            'participants.$[elem].leftAt': new Date(),
                        },
                    },
                    {
                        arrayFilters: [{ 'elem.userId': socket.id }],
                    }
                );

                socket.to(meetingId).emit('user-left', { userId: socket.id });

                // Remove room if empty
                if (participants.size === 0) {
                    rooms.delete(meetingId);
                    // Mark meeting as ended
                    await Meeting.updateOne(
                        { meetingId },
                        { $set: { endTime: new Date() } }
                    );
                }
            }
        });
    });
});

// API Routes
app.post('/api/meetings', async (req, res) => {
    try {
        const meetingId = uuidv4();
        res.json({ meetingId });
    } catch (error) {
        console.error('Error creating meeting:', error);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});

app.get('/api/meetings/:meetingId', async (req, res) => {
    try {
        const meeting = await Meeting.findOne({ meetingId: req.params.meetingId });
        if (!meeting) {
            return res.status(404).json({ error: 'Meeting not found' });
        }
        res.json(meeting);
    } catch (error) {
        console.error('Error fetching meeting:', error);
        res.status(500).json({ error: 'Failed to fetch meeting' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
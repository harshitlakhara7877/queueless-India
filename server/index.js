require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const hospitalRoutes = require('./routes/hospitalRoutes');
const { getQueue, saveToQueue, shiftQueue, getAllRooms } = require('./models/queueStore');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', hospitalRoutes);

// --- WEBSOCKET LOGIC ---

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // JOIN ROOM
  socket.on('joinQueue', ({ hospitalId, service }) => {
    const room = `${hospitalId}-${service}`;
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
    
    // Send current status immediately
    const queue = getQueue(room);
    socket.emit('queueUpdate', {
      queueLength: queue.length,
      estimatedWait: queue.length * 5
    });
  });

  // GENERATE TOKEN (Real-time trigger)
  socket.on('generateToken', ({ hospitalId, service, hospitalName, location }) => {
    const room = `${hospitalId}-${service}`;
    const queue = getQueue(room);
    
    const tokenNumber = queue.length + 1;
    const token = {
      id: `t-${Date.now()}`,
      tokenNumber,
      hospitalId,
      hospitalName,
      service,
      location,
      createdAt: Date.now(),
      status: 'waiting'
    };

    saveToQueue(room, token);

    // Broadcast to everyone in the room
    io.to(room).emit('queueUpdate', {
      queueLength: queue.length + 1,
      nextToken: tokenNumber,
      estimatedWait: (queue.length + 1) * 5
    });
    
    // Confirm back to sender
    socket.emit('tokenGenerated', {
      ...token,
      tokensAhead: queue.length,
      estimatedWaitTime: queue.length * 5
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- AUTO QUEUE PROGRESSION (30 SEC) ---
setInterval(() => {
  const rooms = getAllRooms();
  rooms.forEach(room => {
    const wasShifted = shiftQueue(room);
    if (wasShifted) {
      const queue = getQueue(room);
      io.to(room).emit('queueUpdate', {
        queueLength: queue.length,
        estimatedWait: queue.length * 5
      });
      console.log(`Queue progressed in room: ${room}`);
    }
  });
}, 30000);

// Health Check
app.get('/', (req, res) => res.send('QueueLess Real-Time API is running...'));

server.listen(PORT, () => {
  console.log(`Real-time server running on port ${PORT}`);
});

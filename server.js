const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the public directory
app.use(express.static('public'));

// Load or initialize pixel data
let pixelData = [];
const pixelDataFilePath = 'pixelData.json';

try {
  // Try to read existing pixel data file
  const data = fs.readFileSync(pixelDataFilePath);
  pixelData = JSON.parse(data);
  console.log('Pixel data loaded from file.');
} catch (err) {
  // If file doesn't exist, initialize with an empty array
  console.error('Error loading pixel data:', err);
}

// Function to save pixel data to file
function savePixelData() {
  fs.writeFileSync(pixelDataFilePath, JSON.stringify(pixelData), 'utf8');
  console.log('Pixel data saved to file.');
}

// Keep track of cooldown for each user
const cooldowns = {};

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('A user connected');

  // Send current pixel data to the newly connected client
  socket.emit('updateAllPixels', pixelData);

  // Handle pixel placement
  socket.on('placePixel', (data) => {
    // Check if user has a cooldown
    if (cooldowns[socket.id] && cooldowns[socket.id] > Date.now()) {
      // User is still under cooldown
      return;
    }

    // Add the new pixel to the pixel data
    pixelData.push(data);
    // Broadcast the pixel placement to all connected clients
    io.emit('updatePixel', data);
    // Save pixel data to file
    savePixelData();

    // Set cooldown for the user
    cooldowns[socket.id] = Date.now() + 5000; // 5000 milliseconds cooldown
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove user's cooldown when they disconnect
  });
});

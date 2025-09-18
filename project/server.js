const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const sheets = require('./googleSheets'); // Our custom Google Sheets module

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json()); // Middleware to read JSON
app.use(express.static('public')); // Serve the frontend files

let studentData = {}; // In-memory state of the classroom

// Endpoint to receive updates from the Google Sheet barcode scanner
app.post('/webhook/student-scanned', async (req, res) => {
    const { studentId } = req.body;
    await sheets.markStudentPresent(studentId);
    studentData[studentId].status = 'present';
    
    // Broadcast the update to all connected clients
    io.emit('updateStudentStatus', { studentId, status: 'present' });
    res.sendStatus(200);
});

io.on('connection', (socket) => {
    console.log('A user connected');
    // Send the current chart state to the new user
    socket.emit('initialChartData', studentData);

    socket.on('startTimer', async ({ studentId, type }) => {
        // ... Logic to start timer
        await sheets.startTimerLog(studentId, type);
        // ... Broadcast update
    });

    socket.on('stopTimer', async ({ studentId }) => {
        // ... Logic to stop timer
        await sheets.stopTimerLog(studentId);
        // ... Broadcast update
    });
});

// Initialize the app by loading data from Google Sheets
async function initializeApp() {
    studentData = await sheets.getStudentRoster();
    server.listen(3000, () => {
        console.log('Server listening on port 3000');
    });
}

initializeApp();
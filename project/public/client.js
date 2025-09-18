// Connect to the backend server
const socket = io();

const seatingChart = document.getElementById('seatingChart');
let studentData = {};
let tapTimeout = null;

// Listen for the initial seating chart data from the server
socket.on('initialChartData', (chartData) => {
    studentData = chartData;
    renderChart();
});

// Listen for real-time updates from the server
socket.on('updateStudentStatus', ({ studentId, status, timerInfo }) => {
    studentData[studentId].status = status;
    studentData[studentId].timerInfo = timerInfo;
    updateSeatDisplay(studentId);
});

function renderChart() {
    seatingChart.innerHTML = '';
    // Logic to create all the seat elements based on studentData
    // ...
}

function handleTap(studentId) {
    const student = studentData[studentId];

    // If student is out, a single tap checks them back in
    if (student.status.startsWith('out-')) {
        socket.emit('stopTimer', { studentId });
        return;
    }

    // Differentiate between single and double tap
    if (tapTimeout) { // Double-tap
        clearTimeout(tapTimeout);
        tapTimeout = null;
        socket.emit('startTimer', { studentId, type: 'unexcused' });
    } else { // Single-tap
        tapTimeout = setTimeout(() => {
            socket.emit('startTimer', { studentId, type: 'excused' });
            tapTimeout = null;
        }, 250);
    }
}
// ... other functions like updateSeatDisplay() to change colors and show timers
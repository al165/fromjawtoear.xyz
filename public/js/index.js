const statusSpan = document.getElementById("status");
const tempTable = document.getElementById("sensor_temp");
const humidityTable = document.getElementById("sensor_humidity");

const socket = io();

socket.on('connect', () => {
    statusSpan.innerText = "Connected";
});

socket.on('connect_error', (error) => {
    if (socket.active) {
        statusSpan.innerText = "Reconnecting...";
    } else {
        statusSpan.innerText = "Error";
        console.log(error);
    }
});

socket.on('sensor', (msg) => {
    console.log(msg);
    if (msg.temp) {
        tempTable.innerText = msg.temp;
    }

    if (msg.humidity) {
        humidityTable.innerText = msg.humidity;
    }
});


document.addEventListener('DOMContentLoaded', async function() {
    await initializeMap();
    initializeWebSocket();
});

let map;
let index = 0; // Initialize the index variable
let circleInterval;

// Set manual latitude and longitude values
const manualLat = 28.704060;  // Replace with your desired latitude
const manualLon = 77.102493;  // Replace with your desired longitude

async function initializeMap() {
    await new Promise(resolve => setTimeout(resolve, 500));

    map = L.map('map').setView([manualLat, manualLon], 16);
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16
    }).addTo(map);
}

function initializeWebSocket() {
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = function() {
        console.log('Connected to server');
        socket.send('start'); // Start sending data
    };

    socket.onmessage = function(event) {
        const data = event.data.trim(); // Raw data from the server
        const parsedData = parseSensorData(data);
        if (parsedData) {
            // Use manualLat and manualLon instead of parsedData.lat and parsedData.lon
            placeCircle(manualLat, manualLon, parsedData.aqi);
        }
    };

    socket.onclose = function() {
        console.log('Disconnected from server');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

function parseSensorData(data) {
    const lines = data.split('\n');
    let aqi = null;

    lines.forEach(line => {
        if (line.startsWith('Air Quality:')) {
            aqi = parseFloat(line.split(':')[1].trim());
        }
    });

    if (aqi !== null) {
        return { aqi };
    }
    return null; // Return null if air quality data is missing
}

function placeCircle(lat, lon, aqi) {
    const circle = L.circle([lat, lon], {
        weight: 0, // No border
        color: getColorForAQI(aqi), // Border color if needed
        fillColor: getFillColorForAQI(aqi), // Fill color based on AQI
        fillOpacity: getOpacityForAQI(aqi), // Opacity based on AQI
        radius: getRadiusForAQI(aqi) // Radius based on AQI
    }).addTo(map)
      .bindPopup(`AQI: ${aqi}, Latitude: ${lat}, Longitude: ${lon}`)
      .openPopup();
}

function getColorForAQI(aqi) {
    if (aqi <= 50) return 'darkgreen';
    if (aqi <= 100) return 'lightgreen';
    if (aqi <= 150) return 'yellow';
    if (aqi <= 200) return 'orange';
    if (aqi <= 250) return 'red';
    return 'darkred';
}

function getFillColorForAQI(aqi) {
    return getColorForAQI(aqi);
}

function getOpacityForAQI(aqi) {
    return 0.5;
}

function getRadiusForAQI(aqi) {
    if (aqi <= 50) return 2000;
    if (aqi <= 100) return 1800;
    if (aqi <= 150) return 1600;
    if (aqi <= 200) return 1400;
    if (aqi <= 250) return 1200;
    return 1000;
}

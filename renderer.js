let ws;

function connectWebSocket() {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('WebSocket connection opened');
        ws.send('start');document.addEventListener('DOMContentLoaded', async function() {
    await initializeMap();
    initializeWebSocket();
});

let map;
let circles = [];

async function initializeMap() {
    await new Promise(resolve => setTimeout(resolve, 500));

    map = L.map('map').setView([28.704060, 77.102493], 16);
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
        const data = event.data.trim(); // Assuming data format: "lat,lon,aqi"
        const [lat, lon, aqi] = data.split(',').map(Number);
        placeCircle(lat, lon, aqi);
    };

    socket.onclose = function() {
        console.log('Disconnected from server');
    };

    socket.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

let index = 0; // Initialize the index variable

function placeCircle() {
    if (index < coordinates.length) {
        const { lat, lon, aqi } = coordinates[index];
        const circle = L.circle([lat, lon], {
            weight: 0, // No border
            color: getColorForAQI(aqi), // Border color if needed
            fillColor: getFillColorForAQI(aqi), // Fill color based on AQI
            fillOpacity: getOpacityForAQI(aqi), // Opacity based on AQI
            radius: getRadiusForAQI(aqi) // Radius based on AQI
        }).addTo(map)
          .bindPopup(`AQI: ${aqi}, Latitude: ${lat}, Longitude: ${lon}`)
          .openPopup();
        index++; // Increment the index
    } else {
        clearInterval(circleInterval); // Stop the interval when done
    }
}

// Set an interval to call placeCircle every 1000ms (1 second)
const circleInterval = setInterval(placeCircle, 1000);


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

    };

    ws.onmessage = (event) => {
        const [latitude, longitude, aqi] = event.data.split(',').map(Number);
        if (!isNaN(latitude) && !isNaN(longitude) && !isNaN(aqi)) {
            updateMap(latitude, longitude, aqi);
        }
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };
}

function initMap() {
    var map = L.map('map').setView([28.508, 77.11], 13);

    // Add ESRI World Imagery tile layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    }).addTo(map);
    window.mapInstance = map;

    var circle = L.circle([28.508, 77.11], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.2,
        radius: 500
    }).addTo(map);
}

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    connectWebSocket();
});

function updateMap(latitude, longitude, aqi) {
    const map = window.mapInstance;
    const circleOptions = getCircleOptions(aqi);
    L.circle([latitude, longitude], circleOptions).addTo(map);
}

function getCircleOptions(aqi) {
    let color, radius = 2000, opacity = 0.5;
    
    if (aqi <= 50) {
        color = "darkgreen";
    } else if (aqi <= 100) {
        color = "lightgreen";
    } else if (aqi <= 150) {
        color = "yellow";
    } else if (aqi <= 200) {
        color = "orange";
    } else if (aqi <= 250) {
        color = "red";
    } else {
        color = "darkred";
    }

    return {
        color: color,
        fillColor: color,
        fillOpacity: opacity,
        radius: radius
    };
}

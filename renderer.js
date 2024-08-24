let ws;

function connectWebSocket() {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        console.log('WebSocket connection opened');
        ws.send('start');
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

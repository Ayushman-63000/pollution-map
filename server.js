const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
let serialPort;

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        if (message === 'start') {
            connectToSerialPort(ws);
        } else if (message === 'stop') {
            disconnectFromSerialPort();
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        disconnectFromSerialPort();
    });
});

function connectToSerialPort(ws) {
    serialPort = new SerialPort({ path: '/dev/ttyUSB0', baudRate: 115200 }, (err) => {
        if (err) {
            console.error('Error opening port:', err);
            ws.send(JSON.stringify({ error: 'Failed to open serial port' }));
            return;
        }
        console.log('Port opened successfully');
    });

    const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));
    parser.on('data', (data) => {
        // Assuming data format: "lat,lon,aqi"
        ws.send(data);
    });
}

function disconnectFromSerialPort() {
    if (serialPort) {
        serialPort.close((err) => {
            if (err) {
                console.error('Error closing port:', err);
            } else {
                console.log('Port closed successfully');
            }
        });
    }
}

const mapCanvas = document.getElementById('mapCanvas');
const ctx = mapCanvas.getContext('2d');
let mapInfo = null;

// Movement controls
document.getElementById('forward').addEventListener('click', () => sendTwist(0.5, 0));
document.getElementById('backward').addEventListener('click', () => sendTwist(-0.5, 0));
document.getElementById('left').addEventListener('click', () => sendTwist(0, 1.0));
document.getElementById('right').addEventListener('click', () => sendTwist(0, -1.0));
document.getElementById('stop').addEventListener('click', () => sendTwist(0, 0));

// Goal setting by clicking on the map
mapCanvas.addEventListener('click', handleMapClick);

function sendTwist(linear, angular) {
    fetch('/sendTwist', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linear, angular }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
    })
    .catch((error) => console.error('Error:', error));
}

function handleMapClick(event) {
    if (!mapInfo) return;

    const rect = mapCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert pixel coordinates to map coordinates
    const mapX = (x / mapCanvas.width) * mapInfo.width * mapInfo.resolution + mapInfo.origin.position.x;
    const mapY = ((mapCanvas.height - y) / mapCanvas.height) * mapInfo.height * mapInfo.resolution + mapInfo.origin.position.y;

    sendGoal(mapX, mapY);
}

function sendGoal(x, y) {
    const goalMsg = {
        header: {
            frame_id: "map",
            stamp: {
                sec: Math.floor(Date.now() / 1000), // Current time in seconds
                nanosec: (Date.now() % 1000) * 1e6 // Current time in nanoseconds
            }
        },
        pose: {
            position: {
                x: x,
                y: y,
                z: 0.0
            },
            orientation: {
                x: 0.0,
                y: 0.0,
                z: 0.0,
                w: 1.0
            }
        }
    };

    fetch('/sendGoal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalMsg),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.text();
    })
    .catch((error) => console.error('Error:', error));
}

function fetchMap() {
    fetch('/map')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(mapData => {
            drawMap(mapData);
        })
        .catch(error => console.error('Error fetching map:', error));
}

function drawMap(mapData) {
    mapInfo = mapData.info;
    const width = mapInfo.width;
    const height = mapInfo.height;

    // Adjust canvas size based on map dimensions
    mapCanvas.width = width * 5;
    mapCanvas.height = height * 5;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const value = mapData.data[y * width + x];
            const color = getColor(value);
            ctx.fillStyle = color;
            ctx.fillRect(x * 5, y * 5, 5, 5);  // Scale up for better visibility
        }
    }
}

function getColor(value) {
    if (value === -1) return 'gray';  // Unknown (gray)
    if (value === 0) return 'white';   // Free (white)
    return 'black';  // Occupied (black)
}

// Fetch the map every 2 seconds
setInterval(fetchMap, 200);

// Initial map fetch
fetchMap();

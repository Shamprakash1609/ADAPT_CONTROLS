// let maxLinearSpeed = 0.5;
// let maxAngularSpeed = 1.5;
// let currentView = 'camera'; // Default view

// document.addEventListener('DOMContentLoaded', () => {
//     const joystick = document.querySelector('.joystick');
//     const joystickContainer = document.querySelector('.joystick-container');
//     const maxLinearInput = document.getElementById('maxLinearSpeed');
//     const maxAngularInput = document.getElementById('maxAngularSpeed');
//     const switchButton = document.getElementById('switch-button');
//     const cameraView = document.getElementById('camera-view');
//     const mapView = document.getElementById('map-view');
//     const mapCanvas = document.getElementById('mapCanvas');
//     const ctx = mapCanvas.getContext('2d');
//     let mapInfo = null;

//     // Joystick speed input listeners
//     maxLinearInput.addEventListener('change', () => {
//         maxLinearSpeed = parseFloat(maxLinearInput.value);
//     });

//     maxAngularInput.addEventListener('change', () => {
//         maxAngularSpeed = parseFloat(maxAngularInput.value);
//     });

//     // Initialize joystick dimensions
//     let containerRect = joystickContainer.getBoundingClientRect();
//     let centerX = containerRect.width / 2;
//     let centerY = containerRect.height / 2;
//     let radius = containerRect.width / 2;

//     // Update dimensions on window resize
//     window.addEventListener('resize', () => {
//         containerRect = joystickContainer.getBoundingClientRect();
//         centerX = containerRect.width / 2;
//         centerY = containerRect.height / 2;
//         radius = containerRect.width / 2;
//     });

//     function sendTwist(linear, angular) {
//         const data = { linear, angular };

//         fetch('/sendTwist', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(data)
//         })
//         .then(response => {
//             if (!response.ok) {
//                 console.error('Failed to send twist command');
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
//     }

//     function calculateGlowStrength(x, y) {
//         const distance = Math.sqrt(x * x + y * y);
//         const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
//         let glowStrength = (distance / maxDistance) * 0.7;
//         glowStrength = Math.min(0.3 + glowStrength, 1);
//         return glowStrength;
//     }

//     function updateGlow(event) {
//         let clientX, clientY;
//         if (event.touches) {
//             clientX = event.touches[0].clientX;
//             clientY = event.touches[0].clientY;
//         } else {
//             clientX = event.clientX;
//             clientY = event.clientY;
//         }

//         const x = clientX - containerRect.left - centerX;
//         const y = clientY - containerRect.top - centerY;

//         const glowStrength = calculateGlowStrength(x, y);

//         joystickContainer.style.boxShadow = `0 0 30px rgba(187, 134, 252, ${glowStrength})`;
//     }

//     function onMove(event) {
//         updateGlow(event);

//         let clientX, clientY;
//         if (event.touches) {
//             clientX = event.touches[0].clientX;
//             clientY = event.touches[0].clientY;
//         } else {
//             clientX = event.clientX;
//             clientY = event.clientY;
//         }

//         let x = clientX - containerRect.left - centerX;
//         let y = clientY - containerRect.top - centerY;

//         let distance = Math.sqrt(x * x + y * y);
//         if (distance > radius) {
//             x *= radius / distance;
//             y *= radius / distance;
//         }

//         joystick.style.top = `${centerY + y}px`;
//         joystick.style.left = `${centerX + x}px`;

//         let linearSpeed = maxLinearSpeed * (y / radius);
//         let angularSpeed = -1 * maxAngularSpeed * (x / radius);

//         sendTwist(-linearSpeed, angularSpeed);
//     }

//     function onEnd() {
//         joystick.style.top = '50%';
//         joystick.style.left = '50%';
//         joystick.style.transform = 'translate(-50%, -50%)';
//         sendTwist(0.0, 0.0);
//         document.removeEventListener('mousemove', onMove);
//         document.removeEventListener('mouseup', onEnd);
//         document.removeEventListener('touchmove', onMove);
//         document.removeEventListener('touchend', onEnd);
//         document.removeEventListener('touchcancel', onEnd);

//         joystickContainer.style.boxShadow = '0 0 30px rgba(187, 134, 252, 0.3)'; // Reset glow
//     }

//     joystick.addEventListener('mousedown', event => {
//         event.preventDefault();
//         containerRect = joystickContainer.getBoundingClientRect();
//         centerX = containerRect.width / 2;
//         centerY = containerRect.height / 2;
//         radius = containerRect.width / 2;
//         document.addEventListener('mousemove', onMove);
//         document.addEventListener('mouseup', onEnd);
//     });

//     joystick.addEventListener('touchstart', event => {
//         event.preventDefault();
//         containerRect = joystickContainer.getBoundingClientRect();
//         centerX = containerRect.width / 2;
//         centerY = containerRect.height / 2;
//         radius = containerRect.width / 2;
//         document.addEventListener('touchmove', onMove);
//         document.addEventListener('touchend', onEnd);
//         document.addEventListener('touchcancel', onEnd);
//         onMove(event);
//     });

//     function fetchMap() {
//         fetch('/map')
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok ' + response.statusText);
//                 }
//                 return response.json();
//             })
//             .then(mapData => {
//                 drawMap(mapData);
//             })
//             .catch(error => console.error('Error fetching map:', error));
//     }

//     function drawMap(mapData) {
//         mapInfo = mapData.info;
//         const width = mapInfo.width;
//         const height = mapInfo.height;

//         mapCanvas.width = width * 5;
//         mapCanvas.height = height * 5;

//         for (let y = 0; y < height; y++) {
//             for (let x = 0; x < width; x++) {
//                 const value = mapData.data[y * width + x];
//                 const color = getColor(value);
//                 ctx.fillStyle = color;
//                 ctx.fillRect(x * 5, y * 5, 5, 5);
//             }
//         }
//     }

//     function getColor(value) {
//         if (value === -1) return 'gray';
//         if (value === 0) return 'white';
//         return 'black';
//     }

//     setInterval(fetchMap, 200);
//     fetchMap();

//     // Toggle camera and map view
//     switchButton.addEventListener('click', () => {
//         if (currentView === 'camera') {
//             cameraView.style.display = 'none';
//             mapView.style.display = 'block';
//             switchButton.textContent = 'Switch to Camera';
//             currentView = 'map';
//         } else {
//             cameraView.style.display = 'block';
//             mapView.style.display = 'none';
//             switchButton.textContent = 'Switch to Map';
//             currentView = 'camera';
//         }
//     });
// });


///////////////////////////////////////// NEW CODE \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

let maxLinearSpeed = 0.5;
let maxAngularSpeed = 1.5;
let currentView = 'camera'; // Default view

document.addEventListener('DOMContentLoaded', () => {
    const joystick = document.querySelector('.joystick');
    const joystickContainer = document.querySelector('.joystick-container');
    const maxLinearInput = document.getElementById('maxLinearSpeed');
    const maxAngularInput = document.getElementById('maxAngularSpeed');
    const switchButton = document.getElementById('switch-button');
    const cameraView = document.getElementById('camera-view');
    const mapView = document.getElementById('map-view');
    const mapCanvas = document.getElementById('mapCanvas');
    const ctx = mapCanvas.getContext('2d');
    let mapInfo = null;

    // Joystick speed input listeners
    maxLinearInput.addEventListener('change', () => {
        maxLinearSpeed = parseFloat(maxLinearInput.value);
    });

    maxAngularInput.addEventListener('change', () => {
        maxAngularSpeed = parseFloat(maxAngularInput.value);
    });

    // Initialize joystick dimensions
    let containerRect = joystickContainer.getBoundingClientRect();
    let centerX = containerRect.width / 2;
    let centerY = containerRect.height / 2;
    let radius = containerRect.width / 2;

    // Update dimensions on window resize
    window.addEventListener('resize', () => {
        containerRect = joystickContainer.getBoundingClientRect();
        centerX = containerRect.width / 2;
        centerY = containerRect.height / 2;
        radius = containerRect.width / 2;
    });

    function sendTwist(linear, angular) {
        const data = { linear, angular };

        fetch('/sendTwist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                console.error('Failed to send twist command');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    function calculateGlowStrength(x, y) {
        const distance = Math.sqrt(x * x + y * y);
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
        let glowStrength = (distance / maxDistance) * 0.7;
        glowStrength = Math.min(0.3 + glowStrength, 1);
        return glowStrength;
    }

    function updateGlow(event) {
        let clientX, clientY;
        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        const x = clientX - containerRect.left - centerX;
        const y = clientY - containerRect.top - centerY;

        const glowStrength = calculateGlowStrength(x, y);

        joystickContainer.style.boxShadow = `0 0 30px rgba(187, 134, 252, ${glowStrength})`;
    }

    function onMove(event) {
        updateGlow(event);

        let clientX, clientY;
        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        let x = clientX - containerRect.left - centerX;
        let y = clientY - containerRect.top - centerY;

        let distance = Math.sqrt(x * x + y * y);
        if (distance > radius) {
            x *= radius / distance;
            y *= radius / distance;
        }

        joystick.style.top = `${centerY + y}px`;
        joystick.style.left = `${centerX + x}px`;

        let linearSpeed = maxLinearSpeed * (y / radius);
        let angularSpeed = -1 * maxAngularSpeed * (x / radius);

        sendTwist(-linearSpeed, angularSpeed);
    }

    function onEnd() {
        joystick.style.top = '50%';
        joystick.style.left = '50%';
        joystick.style.transform = 'translate(-50%, -50%)';
        sendTwist(0.0, 0.0);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        document.removeEventListener('touchcancel', onEnd);

        joystickContainer.style.boxShadow = '0 0 30px rgba(187, 134, 252, 0.3)'; // Reset glow
    }

    joystick.addEventListener('mousedown', event => {
        event.preventDefault();
        containerRect = joystickContainer.getBoundingClientRect();
        centerX = containerRect.width / 2;
        centerY = containerRect.height / 2;
        radius = containerRect.width / 2;
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onEnd);
    });

    joystick.addEventListener('touchstart', event => {
        event.preventDefault();
        containerRect = joystickContainer.getBoundingClientRect();
        centerX = containerRect.width / 2;
        centerY = containerRect.height / 2;
        radius = containerRect.width / 2;
        document.addEventListener('touchmove', onMove);
        document.addEventListener('touchend', onEnd);
        document.addEventListener('touchcancel', onEnd);
        onMove(event);
    });

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

        mapCanvas.width = width * 5;
        mapCanvas.height = height * 5;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const value = mapData.data[y * width + x];
                const color = getColor(value);
                ctx.fillStyle = color;
                ctx.fillRect(x * 5, y * 5, 5, 5);
            }
        }
    }

    function getColor(value) {
        if (value === -1) return 'gray';
        if (value === 0) return 'white';
        return 'black';
    }

    setInterval(fetchMap, 200);
    fetchMap();

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

    mapCanvas.addEventListener('click', handleMapClick);

    // Toggle camera and map view
    switchButton.addEventListener('click', () => {
        if (currentView === 'camera') {
            cameraView.style.display = 'none';
            mapView.style.display = 'block';
            switchButton.textContent = 'Switch to Camera';
            currentView = 'map';
        } else {
            cameraView.style.display = 'block';
            mapView.style.display = 'none';
            switchButton.textContent = 'Switch to Map';
            currentView = 'camera';
        }
    });
});

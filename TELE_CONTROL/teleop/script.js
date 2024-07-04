let maxLinearSpeed = 0.5;
let maxAngularSpeed = 1.5;

document.addEventListener('DOMContentLoaded', () => {
    const joystick = document.querySelector('.joystick');
    const joystickContainer = document.querySelector('.joystick-container');
    const maxLinearInput = document.getElementById('maxLinearSpeed');
    const maxAngularInput = document.getElementById('maxAngularSpeed');

    maxLinearInput.addEventListener('change', () => {
        maxLinearSpeed = parseFloat(maxLinearInput.value);
    });

    maxAngularInput.addEventListener('change', () => {
        maxAngularSpeed = parseFloat(maxAngularInput.value);
    });

    let containerRect = joystickContainer.getBoundingClientRect();
    let centerX = containerRect.width / 2;
    let centerY = containerRect.height / 2;
    let radius = containerRect.width / 2;

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
        // Calculate distance from center
        const distance = Math.sqrt(x * x + y * y);

        // Calculate maximum distance (radius) from center
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        // Calculate glow strength based on distance from the center
        // The closer to the edge, the brighter the glow
        let glowStrength = (distance / maxDistance) * 0.7; // Adjusted maximum glow
        glowStrength = Math.min(0.3 + glowStrength, 1); // Adjusted starting glow
        return glowStrength;
    }

    function updateGlow(event) {
        let clientX, clientY;
        if (event.touches) {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY
        }

        const x = clientX - containerRect.left - centerX;
        const y = clientY - containerRect.top - centerY;

        const glowStrength = calculateGlowStrength(x, y);

        joystickContainer.style.boxShadow = `0 0 30px rgba(187, 134, 252, ${glowStrength})`; // Adjusted spread of the glow
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

        joystickContainer.style.boxShadow = '0 0 30px var(--glow-color)'; // Reset glow
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
        onMove(event);
    });

    joystick.addEventListener('touchmove', event => {
        event.preventDefault();
        onMove(event);
    });

    joystick.addEventListener('touchend', onEnd);
    joystick.addEventListener('touchcancel', onEnd);
});

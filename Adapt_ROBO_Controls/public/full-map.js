document.addEventListener('DOMContentLoaded', () => {
    const fullMapCanvas = document.getElementById('fullMapCanvas');
    const ctx = fullMapCanvas.getContext('2d');
    let mapInfo = null;

    function fetchMap() {
        fetch('/map')
            .then(response => response.json())
            .then(data => {
                mapInfo = data;
                drawMap();
            })
            .catch(error => console.error('Failed to fetch map:', error));
    }

    function drawMap() {
        if (!mapInfo) return;
        ctx.clearRect(0, 0, fullMapCanvas.width, fullMapCanvas.height);

        mapInfo.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell === 1) {
                    ctx.fillStyle = 'gray';
                } else if (cell === 2) {
                    ctx.fillStyle = 'green';
                } else {
                    ctx.fillStyle = 'white';
                }
                ctx.fillRect(colIndex * 10, rowIndex * 10, 10, 10);
            });
        });
    }

    fetchMap();
});

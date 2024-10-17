const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

// Audio settings
let audioCtx;
let analyser;
const bufferLength = 256; // Use a fixed buffer length
const dataArray = new Uint8Array(bufferLength);

// Function to start the visualizer
function startVisualizer() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = bufferLength;

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            draw();
        })
        .catch(function (err) {
            console.error('Error accessing the microphone: ' + err);
        });
}

// Automatically start the visualizer after a brief delay
setTimeout(startVisualizer, 1000);

// Visualization parameters
const screenWidth = canvas.width;
const screenHeight = canvas.height;
const baseColor = { r: 255, g: 255, b: 255 };
const numCircles = 10;
const gravitySpeed = 0.2;
const gravityLimit = 250;

let circleAngle = new Array(numCircles).fill(0);
let circleGravity = new Array(numCircles).fill(0);
let squareSize = 20;
let squareBlinking = true;

function draw() {
    requestAnimationFrame(draw);

    if (!analyser || !dataArray) return;

    analyser.getByteTimeDomainData(dataArray);
    const amplitude = Math.max(...dataArray) / 255;

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, screenWidth, screenHeight);

    drawCircles(amplitude);
    drawFibonacciSpiral(amplitude);
    drawBlinkingSquares();
}

function drawCircles(amplitude) {
    for (let i = 0; i < numCircles; i++) {
        circleAngle[i] += 0.05 * (i + 1);

        // Update radius based on amplitude
        let radius = (Math.abs(amplitude) * 50) + 10;
        let zDepth = 100 + i * 5;
        let x = screenWidth / 2 + (zDepth * Math.cos(circleAngle[i]));
        let y = screenHeight / 2 + (zDepth * Math.sin(circleAngle[i])) - (amplitude * 100);

        // Gravity effect
        circleGravity[i] += gravitySpeed;
        if (y + circleGravity[i] > screenHeight - gravityLimit) {
            circleGravity[i] = -Math.abs(circleGravity[i]) * 0.8;
        }
        y += circleGravity[i];

        const color = colorCycle(baseColor, i * 10);
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, radius, 0, Math.PI * 2);
        canvasCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
        canvasCtx.fill();
        canvasCtx.stroke();
    }
}

function drawFibonacciSpiral(amplitude) {
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    let radius = 0;

    for (let i = 0; i < 12; i++) { // Number of turns
        radius += amplitude * 5; // Control the expansion based on amplitude
        const angle = i * Math.PI / 6; // Adjust the angle for spiral
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        canvasCtx.fillStyle = `rgba(255, 215, 0, 0.5)`; // Golden color
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, 5, 0, Math.PI * 2);
        canvasCtx.fill();
    }
}

function drawBlinkingSquares() {
    const squareCount = 5;
    const squareInterval = 100; // Time in ms for blinking
    const timeElapsed = Date.now() % (squareInterval * 2);
    const opacity = (timeElapsed < squareInterval) ? timeElapsed / squareInterval : (squareInterval * 2 - timeElapsed) / squareInterval;

    for (let i = 0; i < squareCount; i++) {
        const size = squareSize * (1 + Math.sin(Date.now() * 0.01 + i)); // Pulsing effect
        const x = Math.random() * (screenWidth - size);
        const y = Math.random() * (screenHeight - size);

        canvasCtx.fillStyle = `rgba(0, 255, 0, ${opacity})`; // Green color for squares
        canvasCtx.fillRect(x, y, size, size);
    }
}

function colorCycle(baseColor, offset) {
    const r = (baseColor.r + offset * 2) % 256;
    const g = (baseColor.g + offset * 3) % 256;
    const b = (baseColor.b + offset * 4) % 256;
    return { r, g, b };
}



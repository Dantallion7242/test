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

function draw() {
    requestAnimationFrame(draw);

    if (!analyser || !dataArray) return;

    analyser.getByteTimeDomainData(dataArray);
    const amplitude = Math.max(...dataArray) / 255; // Normalize amplitude

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, screenWidth, screenHeight); // Clear the screen

    drawWaveform();
    drawCircles(amplitude);
}

function drawWaveform() {
    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    canvasCtx.beginPath();
    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
            canvasCtx.moveTo(x, y);
        } else {
            canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.strokeStyle = 'rgba(255, 215, 0, 0.8)'; // Set stroke color to golden
    canvasCtx.lineWidth = 2; // Set stroke width
    canvasCtx.stroke();
}

function drawCircles(amplitude) {
    for (let i = 0; i < numCircles; i++) {
        circleAngle[i] += 0.05 * (i + 1);

        // Calculate circle properties based on amplitude
        let radius = (Math.abs(amplitude) * 50) + 10; // Dynamic radius with minimum size
        let zDepth = 100 + i * 5;
        let x = screenWidth / 2 + (zDepth * Math.cos(circleAngle[i]));
        let y = screenHeight / 2 + (zDepth * Math.sin(circleAngle[i]));

        // Draw only the outline of the circle
        canvasCtx.beginPath();
        canvasCtx.arc(x, y, radius, 0, Math.PI * 2);
        const color = colorCycle(baseColor, i * 10);
        canvasCtx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
        canvasCtx.lineWidth = 2; // Set stroke width for circles
        canvasCtx.stroke();
    }
}

function colorCycle(baseColor, offset) {
    const r = (baseColor.r + offset * 2) % 256;
    const g = (baseColor.g + offset * 3) % 256;
    const b = (baseColor.b + offset * 4) % 256;
    return { r, g, b };
}


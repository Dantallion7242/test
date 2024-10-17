// static/js/audio-visualizer.js
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

// Audio settings
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Get user's microphone input
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(function(stream) {
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    draw();
  })
  .catch(function(err) {
    console.error('Error accessing the microphone: ' + err);
  });

// Visualization parameters
const screenWidth = canvas.width;
const screenHeight = canvas.height;
const baseColor = { r: 255, g: 255, b: 255 };
const numCircles = 10;
const circleBounceSpeed = 5;
const gravitySpeed = 0.2;
const gravityLimit = 250;

let circleBounce = new Array(numCircles).fill(0);
let circleAngle = new Array(numCircles).fill(0);
let circleGravity = new Array(numCircles).fill(0);
let fibonacciIndex = 1;
let fibonacciValues = [0, 1];

function draw() {
  requestAnimationFrame(draw);
  
  analyser.getByteTimeDomainData(dataArray);
  const amplitude = Math.max(...dataArray); // Amplitude

  canvasCtx.fillStyle = 'rgb(0, 0, 0)';
  canvasCtx.fillRect(0, 0, screenWidth, screenHeight); // Clear the screen

  drawBackgroundGlitches();
  
  const timeElapsed = (Date.now() - startTime) / 1000;
  if (timeElapsed > 44) {
    drawFibonacciTriangle(amplitude);
  } else {
    drawCircles(amplitude, timeElapsed);
  }

  // Update Fibonacci values
  if (fibonacciValues.length <= fibonacciIndex) {
    fibonacciValues.push(fibonacciValues[fibonacciIndex - 1] + fibonacciValues[fibonacciIndex - 2]);
  }
}

function drawCircles(amplitude, timeElapsed) {
  for (let i = 0; i < numCircles; i++) {
    circleAngle[i] += 0.05 * (i + 1);
    
    let radius = (fibonacciValues[i % fibonacciValues.length] % 70) + (amplitude / 10);
    let zDepth = 100 + i * 5;
    let x = screenWidth / 2 + (zDepth * Math.cos(circleAngle[i]));
    let y = screenHeight / 2 + (zDepth * Math.sin(circleAngle[i]));

    // Gravity effect
    circleGravity[i] += gravitySpeed;
    if (y + circleGravity[i] > screenHeight - gravityLimit) {
      circleGravity[i] = -Math.abs(circleGravity[i]) * 0.8;
    }
    y += circleGravity[i];

    // Dynamic color
    const color = colorCycle(baseColor, i * 10);
    canvasCtx.beginPath();
    canvasCtx.arc(x, y, radius, 0, Math.PI * 2);
    canvasCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
    canvasCtx.fill();
    canvasCtx.stroke();
  }
}

function drawFibonacciTriangle(amplitude) {
  if (fibonacciValues.length <= fibonacciIndex) {
    fibonacciValues.push(fibonacciValues[fibonacciIndex - 1] + fibonacciValues[fibonacciIndex - 2]);
  }

  const fibValue = fibonacciValues[fibonacciIndex % fibonacciValues.length];
  const size = fibValue * 5;
  const trianglePoints = [
    { x: screenWidth / 2, y: screenHeight / 2 - size },
    { x: screenWidth / 2 - size, y: screenHeight / 2 + size },
    { x: screenWidth / 2 + size, y: screenHeight / 2 + size }
  ];

  const color = colorCycle(baseColor, fibonacciIndex * 10);
  canvasCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, 1)`;
  canvasCtx.beginPath();
  canvasCtx.moveTo(trianglePoints[0].x, trianglePoints[0].y);
  trianglePoints.forEach(point => canvasCtx.lineTo(point.x, point.y));
  canvasCtx.closePath();
  canvasCtx.fill();
  
  fibonacciIndex++;
}

function drawBackgroundGlitches() {
  // Draw random glitch effects
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * screenWidth;
    const y = Math.random() * screenHeight;
    const w = Math.random() * 50 + 20;
    const h = Math.random() * 50 + 20;
    const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    canvasCtx.fillStyle = color;
    canvasCtx.fillRect(x, y, w, h);
  }
}

function colorCycle(baseColor, offset) {
  const r = (baseColor.r + offset * 2) % 256;
  const g = (baseColor.g + offset * 3) % 256;
  const b = (baseColor.b + offset * 4) % 256;
  return { r, g, b };
}

const startTime = Date.now(); // Track elapsed time


// Load saved code from localStorage, or use default

function setup() {
  let canvas = createCanvas(512, 512);
  noSmooth(); // Disable antialiasing
  canvas.parent("canvas");
  const canvasDiv = document.getElementById("canvas");
  const biggestDimension = Math.max(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
  resizeCanvas(biggestDimension, biggestDimension);
}

function draw() {
  background(0, 0, 0, 5);
  fill(255);
  square(55, 55, 55);
}

function windowResized() {
  const canvasDiv = document.getElementById("canvas");
  const biggestDimension = Math.max(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
  resizeCanvas(biggestDimension, biggestDimension);
}

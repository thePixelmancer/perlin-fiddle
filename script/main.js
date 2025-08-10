import p5 from "p5";

let terrain = null;
let p5Instance = null;

// Global function to update the terrain image
function updateTerrain(imageData) {
  if (!p5Instance || !imageData) return;

  // If imageData is a URL or path
  if (typeof imageData === "string") {
    terrain = p5Instance.loadImage(imageData, (img) => {
      terrain = img;
    });
  }
  // If imageData is an ImageData/HTMLImageElement/ImageBitmap
  else if (
    imageData instanceof ImageData ||
    imageData instanceof HTMLImageElement ||
    imageData instanceof ImageBitmap
  ) {
    terrain = imageData;
  }
  // If imageData is raw pixel data
  else if (imageData.data && imageData.width && imageData.height) {
    const img = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    terrain = img;
  }
}

// Add event listener
window.addEventListener("message", (event) => {
  if (event.data && event.data.type === "updateImage") {
    updateTerrain(event.data.imageData);
  }
});

const sketch = (p5) => {
  p5.preload = () => {
    // Load default image
    terrain = p5.loadImage("../favicon.png");
  };

  p5.setup = () => {
    p5Instance = p5; // Store p5 instance
    let canvas = p5.createCanvas(512, 512);
    p5.noSmooth(); // Disable antialiasing
    canvas.parent("canvas");
    const canvasDiv = document.getElementById("canvas");
    const biggestDimension = Math.max(
      canvasDiv.offsetWidth,
      canvasDiv.offsetHeight
    );
    p5.resizeCanvas(biggestDimension, biggestDimension);
  };

  p5.draw = () => {
    p5.background(0);
    p5.fill(255);
    if (terrain) {
      p5.image(terrain, 50, 50, 500, 500);
    }
  };

  p5.windowResized = () => {
    const canvasDiv = document.getElementById("canvas");
    const biggestDimension = Math.max(
      canvasDiv.offsetWidth,
      canvasDiv.offsetHeight
    );
    p5.resizeCanvas(biggestDimension, biggestDimension);
  };
};

// Create a new p5 instance
new p5(sketch);

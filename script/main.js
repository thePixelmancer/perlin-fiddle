import p5 from "p5";

let terrain;
let p5Instance; // Store p5 instance for use in event listeners

const sketch = (p5) => {
  p5.preload = () => {
    terrain = p5.loadImage("../favicon.png");
  };

  p5.setup = () => {
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

  // Store the p5 instance for use in event listeners
  p5Instance = p5;

  // Function to update the terrain image
  function updateTerrain(imageData) {
    if (imageData) {
      // If imageData is a URL or path
      if (typeof imageData === 'string') {
        terrain = p5.loadImage(imageData, img => {
          terrain = img;
        });
      } 
      // If imageData is an ImageData/HTMLImageElement/ImageBitmap
      else if (imageData instanceof ImageData || 
               imageData instanceof HTMLImageElement || 
               imageData instanceof ImageBitmap) {
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
  }

  // Listen for messages to update the image
  window.addEventListener('message', function(event) {
    // For security, you might want to verify the origin here
    // if (event.origin !== 'expected-origin') return;
    
    if (event.data && event.data.type === 'updateImage') {
      updateTerrain(event.data.imageData);
    }
  });

  p5.draw = () => {
    p5.background(0);
    p5.fill(255);
    if (terrain) {
      if (terrain instanceof p5.Image) {
        p5.image(terrain, 50, 50, 500, 500);
      } else {
        // Handle other image types if needed
        p5.image(terrain, 50, 50, 500, 500);
      }
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

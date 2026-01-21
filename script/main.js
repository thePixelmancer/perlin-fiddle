import p5 from "p5";

// Global state
const SKETCH_CONTENT = {
  text: "Type something and click Run!",
  pixelArray: [],
};

// Get the sandbox iframe
const SANDBOX = document.getElementById("sandbox-iframe");

// Handle messages from sandbox
window.addEventListener("message", (event) => {
  // Only process messages from our sandbox
  if (event.source !== SANDBOX.contentWindow) return;

  if (typeof event.data === "object") {
    SKETCH_CONTENT.text = event.data.text;
    SKETCH_CONTENT.pixelArray = event.data.pixelArray;
  }
});
// Create a p5.Image from a pixel array
// pixelArray should be a Uint8ClampedArray or array with RGBA values
function imageFromArray(sketch, pixelArray) {
  if (!pixelArray || pixelArray.length === 0) return null;

  // Calculate dimensions - assuming square image for now
  // Adjust this if your pixel array uses different dimensions
  const pixelCount = pixelArray.length / 4; // RGBA = 4 bytes per pixel
  const size = Math.sqrt(pixelCount);

  if (size !== Math.floor(size)) {
    console.warn("Pixel array length does not form a perfect square");
    return null;
  }

  const img = sketch.createImage(size, size);
  img.loadPixels();

  // Copy pixel data
  for (let i = 0; i < pixelArray.length; i++) {
    img.pixels[i] = pixelArray[i];
  }

  img.updatePixels();
  return img;
}

// Initialize p5
new p5((sketch) => {
  sketch.setup = () => {
    const canvasDiv = document.querySelector("#canvas > div");
    sketch.createCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight).parent(canvasDiv);
  };

  sketch.draw = () => {
    sketch.noSmooth();
    sketch.background(0);

    // Draw image if pixelArray exists and has data
    if (SKETCH_CONTENT.pixelArray && SKETCH_CONTENT.pixelArray.length > 0) {
      const imageData = imageFromArray(sketch, SKETCH_CONTENT.pixelArray);
      if (imageData) {
        sketch.image(imageData, 10, 10);
      }
    }

    // Draw text
    sketch.textSize(24);
    sketch.textAlign(sketch.CENTER, sketch.CENTER);
    sketch.fill(255);
    sketch.noStroke();
    sketch.text(SKETCH_CONTENT.text, sketch.width / 2, sketch.height / 2);
  };

  sketch.windowResized = () => {
    const canvasDiv = document.querySelector("#canvas > div");
    if (canvasDiv) {
      sketch.resizeCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
    }
  };

  // Initial resize to ensure proper sizing
  sketch.windowResized();
}, "canvas");
/* -------------------------------------------------------------------------- */
// Set up the run button
document.getElementById("run-button")?.addEventListener("click", () => {
  const worldSize = parseInt(document.getElementById("worldSizeInput").value) || 512;
  const codeEditorText = window.editor.getValue();

  if (window.editor) {
    sendToSandbox({ userInput: codeEditorText, worldSize: worldSize });
  }
});
// Process code through sandbox
function sendToSandbox(object) {
  if (SANDBOX?.contentWindow) {
    SANDBOX.contentWindow.postMessage(object, "*");
  }
}

import p5 from "p5";

// Global state
const SKETCH_CONTENT = {
  text: "Type code and click Run!",
  pixelArray: [],
};

// Camera state for pan and zoom
const CAMERA = {
  x: 0,
  y: 0,
  zoom: 1,
};

// Mouse state for panning
const MOUSE_STATE = {
  isDragging: false,
  lastX: 0,
  lastY: 0,
};

// Get the sandbox iframe
const SANDBOX = document.getElementById("sandbox-iframe");

// Handle messages from sandbox
window.addEventListener("message", (event) => {
  // Only process messages from our sandbox
  if (event.source !== SANDBOX.contentWindow) return;

  if (typeof event.data === "object" && event.data.type) {
    switch (event.data.type) {
      case "pixelArray":
        SKETCH_CONTENT.pixelArray = event.data.message;
        SKETCH_CONTENT.text = ""; // Clear any previous error text
        break;
      case "error":
        SKETCH_CONTENT.text = event.data.message;
        SKETCH_CONTENT.pixelArray = []; // Clear pixel array on error
        break;
    }
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
    sketch.noSmooth();
  };

  sketch.draw = () => {
    sketch.background(0);

    // Draw image if pixelArray exists and has data
    if (SKETCH_CONTENT.pixelArray && SKETCH_CONTENT.pixelArray.length > 0) {
      const imageData = imageFromArray(sketch, SKETCH_CONTENT.pixelArray);
      if (imageData) {
        // Apply transformations (translate and scale)
        sketch.push();
        sketch.translate(CAMERA.x, CAMERA.y);
        sketch.scale(CAMERA.zoom);
        sketch.image(imageData, 10, 10);
        sketch.pop();
      }
    }

    // Draw text
    sketch.textSize(16);
    sketch.textAlign(sketch.RIGHT, sketch.BOTTOM);
    sketch.fill(255);
    sketch.noStroke();
    sketch.text(SKETCH_CONTENT.text, sketch.width - 10, sketch.height - 10);
  };

  sketch.windowResized = () => {
    const canvasDiv = document.querySelector("#canvas > div");
    if (canvasDiv) {
      sketch.resizeCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
    }
  };

  // Mouse wheel for zoom
  sketch.mouseWheel = (event) => {
    const canvasDiv = document.querySelector("#canvas > div");
    const rect = canvasDiv.getBoundingClientRect();
    const isOverCanvas = sketch.mouseX >= 0 && sketch.mouseX <= sketch.width && sketch.mouseY >= 0 && sketch.mouseY <= sketch.height;

    if (isOverCanvas) {
      const zoomSpeed = 0.4;
      const oldZoom = CAMERA.zoom;
      CAMERA.zoom *= 1 - event.delta * zoomSpeed * 0.001;
      CAMERA.zoom = Math.max(0.1, Math.min(CAMERA.zoom, 10)); // Clamp zoom between 0.1x and 10x

      // Zoom towards mouse position
      const zoomChange = CAMERA.zoom - oldZoom;
      CAMERA.x -= (sketch.mouseX - CAMERA.x) * (zoomChange / oldZoom);
      CAMERA.y -= (sketch.mouseY - CAMERA.y) * (zoomChange / oldZoom);

      event.preventDefault();
      return false;
    }
  };

  // Mouse events for panning
  sketch.mousePressed = () => {
    const canvasDiv = document.querySelector("#canvas > div");
    const isOverCanvas = sketch.mouseX >= 0 && sketch.mouseX <= sketch.width && sketch.mouseY >= 0 && sketch.mouseY <= sketch.height;

    if (isOverCanvas) {
      MOUSE_STATE.isDragging = true;
      MOUSE_STATE.lastX = sketch.mouseX;
      MOUSE_STATE.lastY = sketch.mouseY;
      return false;
    }
  };

  sketch.mouseDragged = () => {
    if (MOUSE_STATE.isDragging) {
      const deltaX = sketch.mouseX - MOUSE_STATE.lastX;
      const deltaY = sketch.mouseY - MOUSE_STATE.lastY;

      CAMERA.x += deltaX;
      CAMERA.y += deltaY;

      MOUSE_STATE.lastX = sketch.mouseX;
      MOUSE_STATE.lastY = sketch.mouseY;
      return false;
    }
  };

  sketch.mouseReleased = () => {
    MOUSE_STATE.isDragging = false;
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

import p5 from "p5";

// Global state
const SKETCH_CONTENT = {
  text: "Type code and click Run!",
  pixelArray: [],
  cachedImage: null,
};

// Camera state for pan and zoom
const CAMERA = {
  x: 0,
  y: 0,
  zoom: 1,
  needsCentering: true, // Flag to center on new content
};

// Mouse state for panning
const MOUSE_STATE = {
  isDragging: false,
  lastX: 0,
  lastY: 0,
};

// Touch state for pinch-zoom and touch panning
const TOUCH_STATE = {
  isPinching: false,
  startDist: 0,
  startZoom: 1,
  center: { x: 0, y: 0 },
};

// Get the sandbox iframe
const SANDBOX = document.getElementById("sandbox-iframe");

// Function to center and fit sketch to canvas
function centerAndFitSketch(sketch, imageSize) {
  if (!imageSize) return;

  const canvasWidth = sketch.width;
  const canvasHeight = sketch.height;

  // Calculate zoom to fit image with some padding
  const padding = 40;
  const scaleX = (canvasWidth - padding * 2) / imageSize;
  const scaleY = (canvasHeight - padding * 2) / imageSize;
  const fitZoom = Math.min(scaleX, scaleY, 30); // Max zoom 30x

  // Center the image
  CAMERA.x = (canvasWidth - imageSize * fitZoom) / 2;
  CAMERA.y = (canvasHeight - imageSize * fitZoom) / 2;
  CAMERA.zoom = fitZoom;
  CAMERA.needsCentering = false;
}

// Handle messages from sandbox
window.addEventListener("message", (event) => {
  // Only process messages from our sandbox
  if (event.source !== SANDBOX.contentWindow) return;

  if (typeof event.data === "object" && event.data.type) {
    switch (event.data.type) {
      case "pixelArray":
        SKETCH_CONTENT.pixelArray = event.data.message;
        SKETCH_CONTENT.cachedImage = null; // Clear cached image when new data arrives
        SKETCH_CONTENT.text = ""; // Clear any previous error text
        CAMERA.needsCentering = true; // Flag to center new content
        break;
      case "error":
        SKETCH_CONTENT.text = event.data.message;
        SKETCH_CONTENT.pixelArray = []; // Clear pixel array on error
        SKETCH_CONTENT.cachedImage = null; // Clear cached image on error
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

// Convert a Touch object to canvas-local coordinates
function getTouchPos(sketch, touch) {
  const rect = sketch.canvas.getBoundingClientRect();
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top,
  };
}

// Draw grid overlay that moves and zooms with content
function drawGrid(sketch, imageSize) {
  const gridSize = parseInt(document.getElementById("gridSizeInput").value) || imageSize;
  const gridColor = document.getElementById("gridColorInput").value;

  // Convert hex color to RGB
  const r = parseInt(gridColor.substr(1, 2), 16);
  const g = parseInt(gridColor.substr(3, 2), 16);
  const b = parseInt(gridColor.substr(5, 2), 16);

  sketch.push();

  // Apply the same transformations as the image
  sketch.translate(CAMERA.x, CAMERA.y);
  sketch.scale(CAMERA.zoom);
  sketch.blendMode(sketch.DIFFERENCE);
  // Set grid styling with constant stroke weight (not affected by zoom)
  sketch.stroke(r, g, b, 200); // Semi-transparent
  sketch.strokeWeight(1 / CAMERA.zoom); // Counteract the scale to keep stroke constant

  // Calculate grid bounds
  const gridCount = Math.floor(imageSize / gridSize);

  // Draw vertical lines. start from 1 no need to draw the line at the edge
  for (let i = 1; i <= gridCount; i++) {
    const x = i * gridSize;
    sketch.line(x, 0, x, imageSize);
  }

  // Draw horizontal lines
  for (let i = 1; i <= gridCount; i++) {
    const y = i * gridSize;
    sketch.line(0, y, imageSize, y);
  }

  sketch.pop();
}

// Draw debug info overlay showing coordinates, size, camera position, and zoom level
function drawDebugInfo(sketch, imageData) {
  // Calculate mouse coordinates relative to image
  const imageX = (sketch.mouseX - CAMERA.x) / CAMERA.zoom;
  const imageY = (sketch.mouseY - CAMERA.y) / CAMERA.zoom;

  sketch.textSize(12);
  sketch.textAlign(sketch.LEFT, sketch.TOP);
  sketch.fill(255);
  sketch.noStroke();
  const debugText = `Pos: (${Math.floor(imageX)}, ${Math.floor(imageY)})
Zoom: ${CAMERA.zoom.toFixed(2)}x`;
  sketch.text(debugText, 10, 10);
}

// Initialize p5
new p5((sketch) => {
  sketch.setup = () => {
    const canvasDiv = document.querySelector("#canvas > div");
    sketch.createCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight).parent(canvasDiv);
    sketch.noSmooth();

    // Attach touch listeners to support single-finger pan and two-finger pinch-to-zoom
    const canvasEl = sketch.canvas;

    canvasEl.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches) return;

        if (e.touches.length === 1) {
          // Start panning with one finger
          const pos = getTouchPos(sketch, e.touches[0]);
          MOUSE_STATE.isDragging = true;
          MOUSE_STATE.lastX = pos.x;
          MOUSE_STATE.lastY = pos.y;
        } else if (e.touches.length === 2) {
          // Start pinch
          MOUSE_STATE.isDragging = false;
          TOUCH_STATE.isPinching = true;
          const p1 = getTouchPos(sketch, e.touches[0]);
          const p2 = getTouchPos(sketch, e.touches[1]);
          TOUCH_STATE.startDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
          TOUCH_STATE.startZoom = CAMERA.zoom;
          TOUCH_STATE.center = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
        }

        // Prevent page from scrolling while interacting with the canvas
        e.preventDefault();
      },
      { passive: false },
    );

    canvasEl.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches) return;

        if (TOUCH_STATE.isPinching && e.touches.length >= 2) {
          const p1 = getTouchPos(sketch, e.touches[0]);
          const p2 = getTouchPos(sketch, e.touches[1]);
          const newDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

          if (TOUCH_STATE.startDist > 0) {
            const oldZoom = CAMERA.zoom;
            let newZoom = TOUCH_STATE.startZoom * (newDist / TOUCH_STATE.startDist);
            newZoom = Math.max(0.1, Math.min(newZoom, 50));
            CAMERA.zoom = newZoom;

            // Zoom towards the current midpoint of the touches
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            const zoomChange = CAMERA.zoom - oldZoom;
            if (oldZoom !== 0) {
              CAMERA.x -= (midX - CAMERA.x) * (zoomChange / oldZoom);
              CAMERA.y -= (midY - CAMERA.y) * (zoomChange / oldZoom);
            }
          }

          e.preventDefault();
        } else if (MOUSE_STATE.isDragging && e.touches.length === 1) {
          // Single-finger pan
          const pos = getTouchPos(sketch, e.touches[0]);
          const deltaX = pos.x - MOUSE_STATE.lastX;
          const deltaY = pos.y - MOUSE_STATE.lastY;

          CAMERA.x += deltaX;
          CAMERA.y += deltaY;

          MOUSE_STATE.lastX = pos.x;
          MOUSE_STATE.lastY = pos.y;

          e.preventDefault();
        }
      },
      { passive: false },
    );

    canvasEl.addEventListener("touchend", (e) => {
      if (!e.touches || e.touches.length === 0) {
        MOUSE_STATE.isDragging = false;
        TOUCH_STATE.isPinching = false;
      } else if (e.touches.length === 1) {
        // If one touch remains, switch to pan mode
        const pos = getTouchPos(sketch, e.touches[0]);
        MOUSE_STATE.isDragging = true;
        MOUSE_STATE.lastX = pos.x;
        MOUSE_STATE.lastY = pos.y;
        TOUCH_STATE.isPinching = false;
      }
    });

    canvasEl.addEventListener("touchcancel", (e) => {
      MOUSE_STATE.isDragging = false;
      TOUCH_STATE.isPinching = false;
    });
  };

  sketch.draw = () => {
    sketch.background(31, 39, 55); // Tailwind bg-gray-800
    // Add pattern drawing logic here if needed

    // Draw image if pixelArray exists and has data
    if (SKETCH_CONTENT.pixelArray && SKETCH_CONTENT.pixelArray.length > 0) {
      // Create cached image if it doesn't exist
      if (!SKETCH_CONTENT.cachedImage) {
        SKETCH_CONTENT.cachedImage = imageFromArray(sketch, SKETCH_CONTENT.pixelArray);
      }

      const imageData = SKETCH_CONTENT.cachedImage;
      if (imageData) {
        // Center and fit if this is new content
        if (CAMERA.needsCentering) {
          centerAndFitSketch(sketch, imageData.width);
        }

        // Apply transformations (translate and scale)
        sketch.push();
        sketch.translate(CAMERA.x, CAMERA.y);
        sketch.scale(CAMERA.zoom);
        sketch.image(imageData, 0, 0);
        sketch.pop();

        // Draw grid overlay
        drawGrid(sketch, imageData.width);

        // Draw debug info
        drawDebugInfo(sketch, imageData);
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
    const isOverCanvas = sketch.mouseX >= 0 && sketch.mouseX <= sketch.width && sketch.mouseY >= 0 && sketch.mouseY <= sketch.height;

    if (isOverCanvas) {
      const zoomSpeed = 0.4;
      const oldZoom = CAMERA.zoom;
      CAMERA.zoom *= 1 - event.delta * zoomSpeed * 0.001;
      CAMERA.zoom = Math.max(0.1, Math.min(CAMERA.zoom, 50)); // Clamp zoom between 0.1x and 50x

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

// Add Shift+Enter keyboard shortcut to run the code
document.addEventListener("keydown", (event) => {
  if (event.shiftKey && event.key === "Enter") {
    const runButton = document.getElementById("run-button");
    if (runButton) {
      runButton.click();
      event.preventDefault();
    }
  }
});
// Process code through sandbox
function sendToSandbox(object) {
  if (SANDBOX?.contentWindow) {
    SANDBOX.contentWindow.postMessage(object, "*");
  }
}

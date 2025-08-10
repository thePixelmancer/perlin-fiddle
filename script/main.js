import p5 from "p5";

// Global state
const STATE = {
  text: "Type something and click Run!",
};

// Get the sandbox iframe
const SANDBOX = document.getElementById("sandbox-iframe");

// Handle messages from sandbox
window.addEventListener("message", (event) => {
  // Only process messages from our sandbox
  if (event.source !== SANDBOX.contentWindow) return;

  // Update the text if we get a string back
  if (typeof event.data === "string") {
    STATE.text = event.data;
  }
});

// Process code through sandbox
function processCode(code) {
  if (SANDBOX?.contentWindow) {
    SANDBOX.contentWindow.postMessage(code, "*");
  }
}

// Initialize p5
new p5((p) => {
  p.setup = () => {
    const canvasDiv = document.querySelector("#canvas > div");
    p.createCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight).parent(canvasDiv);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(24);
    p.fill(255);
    p.noStroke();
  };

  p.draw = () => {
    p.background(0);
    p.text(STATE.text, p.width / 2, p.height / 2);
  };

  p.windowResized = () => {
    const canvasDiv = document.querySelector("#canvas > div");
    if (canvasDiv) {
      p.resizeCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
    }
  };
  
  // Initial resize to ensure proper sizing
  p.windowResized();
}, "canvas");

// Set up the run button
document.getElementById("run-button")?.addEventListener("click", () => {
  if (window.editor) {
    processCode(editor.getValue());
  }
});

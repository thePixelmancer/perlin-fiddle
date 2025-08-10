import p5 from "p5";

let p5Instance = null;
let sandboxFrame = null;
let currentText = "Type something and click Run!";

// Initialize the sandbox iframe
function initSandbox() {
  return new Promise((resolve, reject) => {
    console.log("Initializing sandbox...");

    // Remove any existing iframe
    const existingIframe = document.querySelector("iframe[sandbox]");
    if (existingIframe) {
      document.body.removeChild(existingIframe);
    }

    // Create new sandbox iframe
    sandboxFrame = document.createElement("iframe");
    sandboxFrame.style.display = "none";
    sandboxFrame.sandbox = "allow-scripts allow-same-origin";
    sandboxFrame.src = "sandbox.html";

    console.log("Appending sandbox iframe to body");
    document.body.appendChild(sandboxFrame);

    // Set up message listener before iframe loads
    const messageHandler = (event) => {
      console.log("Main: Received message event:", event);
      console.log("Message data:", event.data);
      console.log("Message source:", event.source);
      console.log(
        "Sandbox frame contentWindow:",
        sandboxFrame ? sandboxFrame.contentWindow : "No sandbox frame"
      );

      // Only process messages from our sandbox iframe
      if (!sandboxFrame) {
        console.error("Main: No sandbox frame reference");
        return;
      }

      if (event.source !== sandboxFrame.contentWindow) {
        console.log("Main: Ignoring message from non-sandbox source");
        return;
      }

      // Handle sandbox test and ready messages
      if (
        event.data === "SANDBOX_READY" ||
        event.data === "SANDBOX_TEST_RESPONSE"
      ) {
        console.log("Main: Sandbox is ready");
        return;
      }

      // Handle error messages from sandbox
      if (typeof event.data === "string" && event.data.startsWith("Error:")) {
        console.error("Main: Error from sandbox:", event.data);
        currentText = event.data;
      } else {
        // Handle normal processed code
        console.log("Main: Updating text with processed code");
        currentText = event.data;
      }

      // Trigger redraw if p5 instance is available
      if (p5Instance) {
        console.log("Main: Triggering p5 redraw");
        p5Instance.redraw();
      }
    };

    // Add the message listener
    window.addEventListener("message", messageHandler);

    // Set up iframe load handler
    const loadHandler = () => {
      console.log("Sandbox iframe loaded successfully");

      // Verify if contentWindow is accessible
      if (!sandboxFrame.contentWindow) {
        const error = "Sandbox iframe contentWindow is not accessible";
        console.error(error);
        reject(new Error(error));
        return;
      }

      // Send a test message to verify communication
      try {
        console.log("Sending TEST_MESSAGE to sandbox...");
        sandboxFrame.contentWindow.postMessage("TEST_MESSAGE", "*");
        console.log("Successfully sent TEST_MESSAGE to sandbox");

        // Set a small delay before resolving to ensure sandbox is ready
        setTimeout(() => {
          console.log("Sandbox initialization complete");
          resolve();
        }, 100);
      } catch (error) {
        console.error("Error sending test message to sandbox:", error);
        reject(error);
      }
    };

    sandboxFrame.onload = loadHandler;
    sandboxFrame.onerror = (error) => {
      console.error("Error loading sandbox iframe:", error);
      reject(error);
    };

    // Set a timeout in case the iframe fails to load
    setTimeout(() => {
      if (!sandboxFrame.contentWindow) {
        const error = new Error("Sandbox iframe failed to load within timeout");
        console.error(error);
        reject(error);
      }
    }, 5000);
  });
}

// Function to process code through sandbox
function processCode(code) {
  console.log("Process code called with:", code);
  if (!sandboxFrame) {
    console.error("Sandbox frame not initialized");
    return;
  }
  if (!sandboxFrame.contentWindow) {
    console.error("Sandbox contentWindow not available");
    return;
  }
  console.log("Sending code to sandbox");
  sandboxFrame.contentWindow.postMessage(code, "*");
  console.log("Code sent to sandbox");
}

// Initialize everything when the window loads
window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM fully loaded");

  // Check if CodeMirror is loaded
  if (typeof CodeMirror === "undefined") {
    console.error("CodeMirror is not loaded!");
  } else {
    console.log("CodeMirror is loaded");
  }

  // Check if editor is available
  if (typeof window.editor === "undefined") {
    console.error("Editor is not available in window object!");
  } else {
    console.log("Editor is available in window object");
  }

  // Initialize the p5 sketch
  const sketch = (p) => {
    // Store p5 instance globally for access from other functions
    p5Instance = p;
    p.setup = () => {
      console.log("p5 setup running");
      const canvasDiv = document.getElementById("canvas");

      const canvas = p.createCanvas(
        canvasDiv.offsetWidth,
        canvasDiv.offsetHeight
      );

      console.log(
        "Canvas created with size:",
        canvas.width,
        "x",
        canvas.height
      );
      p.textAlign(p.CENTER, p.CENTER);
      p.textSize(24);
      p.fill(255);
      p.noStroke();
      console.log("p5 setup complete");
    };

    p.draw = () => {
      p.background(40);
      p.fill(255);
      p.text(currentText, p.width / 2, p.height / 2);
    };

    p.windowResized = () => {
      const canvasDiv = document.getElementById("canvas");
      if (canvasDiv) {
        p.resizeCanvas(canvasDiv.offsetWidth, canvasDiv.offsetHeight);
      }
    };
  };

  // Create a single p5 instance
  new p5(sketch, "canvas");

  console.log("Initializing sandbox...");
  try {
    await initSandbox();
    console.log("Sandbox initialized successfully");
  } catch (error) {
    console.error("Failed to initialize sandbox:", error);
  }

  // Set up the run button
  console.log("Setting up run button...");
  const runButton = document.getElementById("run-button");
  if (runButton) {
    console.log("Run button found, adding click handler");
    runButton.addEventListener("click", () => {
      console.log("Run button clicked!");
      if (window.editor) {
        console.log("Editor found, getting value...");
        const code = editor.getValue();
        console.log("Editor value:", code);
        processCode(code);
      } else {
        console.error("Editor not found in window object");
      }
    });
  }
});

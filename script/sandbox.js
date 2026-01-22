// Pixel processing utilities
function normalizePixels(pixelArray) {
  const result = new Uint8ClampedArray(pixelArray.length * 4);
  let resultIdx = 0;

  for (let i = 0; i < pixelArray.length; i++) {
    const pixel = pixelArray[i];
    result[resultIdx++] = Math.round(pixel.r * 255);
    result[resultIdx++] = Math.round(pixel.g * 255);
    result[resultIdx++] = Math.round(pixel.b * 255);
    result[resultIdx++] = 255;
  }

  return result;
}

// Security utilities
function createSecureEnvironment() {
  const originalAlert = window.alert;
  const originalConsole = window.console;

  // Override blocking APIs
  window.alert = () => {};
  window.console = {
    log: () => {},
    error: () => {},
    warn: () => {},
    info: () => {},
  };

  return () => {
    window.alert = originalAlert;
    window.console = originalConsole;
  };
}

// Math library
function createMathLibrary() {
  return {
    abs: Math.abs,
    sin: Math.sin,
    cos: Math.cos,
    clamp: (value, min, max) => Math.max(min, Math.min(max, value)),
    ceil: Math.ceil,
    floor: Math.floor,
    trunc: Math.trunc,
    round: Math.round,
    mod: (value, denominator) => value % denominator,
    pow: Math.pow,
    sqrt: Math.sqrt,
    exp: Math.exp,
    pi: Math.PI,
    max: Math.max,
    min: Math.min,
    min_angle: (value) => {
      let angle = value % (2 * Math.PI);
      if (angle > Math.PI) angle -= 2 * Math.PI;
      if (angle < -Math.PI) angle += 2 * Math.PI;
      return angle;
    },
    asin: Math.asin,
    acos: Math.acos,
    atan: Math.atan,
    atan2: Math.atan2,
    random: (low, high) => Math.random() * (high - low) + low,
    random_integer: (low, high) => Math.floor(Math.random() * (high - low + 1)) + low,
    die_roll: (num, low, high) => {
      let sum = 0;
      for (let i = 0; i < num; i++) {
        sum += Math.random() * (high - low) + low;
      }
      return sum / num;
    },
    die_roll_integer: (num, low, high) => {
      let sum = 0;
      for (let i = 0; i < num; i++) {
        sum += Math.floor(Math.random() * (high - low + 1)) + low;
      }
      return Math.floor(sum / num);
    },
    hermite_blend: (value) => value * value * (3 - 2 * value),
    lerp: (start, end, t) => start + (end - start) * t,
    lerprotate: (start, end, t) => {
      let diff = end - start;
      if (diff > Math.PI) diff -= 2 * Math.PI;
      if (diff < -Math.PI) diff += 2 * Math.PI;
      return start + diff * t;
    },
    ln: Math.log,
  };
}

// Query library
function createQueryLibrary(p5Instance) {
  return {
    noise: (x, y) => p5Instance.noise(x, y) * 2 - 1,
  };
}

// User function factory
function createUserFunction(userInput) {
  return new Function(
    "x",
    "y",
    "math",
    "query",
    `
      const variable = {
        originx: x,
        originz: y,
        worldx: x,
        worldz: y,
      };
      const v = variable;
      const q = query;
      
      // Execute user's custom code
      ${userInput}
      
      return 0;
    `
  );
}

// Process pixel results
function processPixelResult(colorResult, math) {
  if (colorResult && typeof colorResult === "object") {
    return { r: colorResult.r ?? 0, g: colorResult.g ?? 0, b: colorResult.b ?? 0 };
  } else if (typeof colorResult === "number") {
    const clampedColorResult = math.clamp(colorResult, 0, 1);
    return { r: clampedColorResult, g: clampedColorResult, b: clampedColorResult };
  }
  return { r: 0, g: 0, b: 0 };
}

// Main message handler
window.addEventListener("message", (event) => {
  // Validate message source
  if (event.source !== window.parent) return;
  if (!event.data || typeof event.data !== "object") return;

  const restoreEnvironment = createSecureEnvironment();

  try {
    const { userInput, worldSize } = event.data;

    // Initialize p5 instance
    const p5Instance = new p5(function (p) {
      p.setup = function () {
        p.noiseSeed(12345);
        p.noCanvas();
      };
    });

    // Create libraries
    const math = Object.freeze(createMathLibrary());
    const query = Object.freeze(createQueryLibrary(p5Instance));
    const userFunction = createUserFunction(userInput);

    // Generate pixels
    const pixelArray = [];

    for (let y = 0; y < worldSize; y++) {
      for (let x = 0; x < worldSize; x++) {
        const colorResult = userFunction(x, y, math, query);
        pixelArray.push(processPixelResult(colorResult, math));
      }
    }

    const result = { text: "", pixelArray: normalizePixels(pixelArray) };
    window.parent.postMessage(result, "*");
  } catch (error) {
    window.parent.postMessage(
      {
        text: `Error: ${error.message}`,
        pixelArray: [],
      },
      "*"
    );
  } finally {
    restoreEnvironment();
  }
});

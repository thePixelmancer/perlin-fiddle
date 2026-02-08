// Define custom hints for autocomplete
const customHints = [
  { text: "q.noise(x, y)", displayText: "noise(x, y) - 2D perlin noise" },
  { text: "math.random(min,max)", displayText: "math.random(min, max) - Random number between min and max" },
  { text: "math.random_integer(min,max)", displayText: "math.random_integer(min, max) - Random integer between min and max" },
  { text: "math.lerp(start, stop, t)", displayText: "math.lerp(start, stop, 0 to 1) - Linear interpolation" },
  { text: "math.lerprotate(start, stop, t)", displayText: "math.lerprotate(start, stop, 0 to 1) - Linear interpolation for angles" },
  { text: "math.abs(value)", displayText: "math.abs(value) - Absolute value" },
  { text: "math.sin(value)", displayText: "math.sin(value) - Sine function" },
  { text: "math.cos(value)", displayText: "math.cos(value) - Cosine function" },
  { text: "math.clamp(value, min, max)", displayText: "math.clamp(value, min, max) - Clamp value between min and max" },
  { text: "math.ceil(value)", displayText: "math.ceil(value) - Round up to nearest integer" },
  { text: "math.floor(value)", displayText: "math.floor(value) - Round down to nearest integer" },
  { text: "math.trunc(value)", displayText: "math.trunc(value) - Truncate decimal part" },
  { text: "math.round(value)", displayText: "math.round(value) - Round to nearest integer" },
  { text: "math.mod(value, denominator)", displayText: "math.mod(value, denominator) - Modulo operation" },
  { text: "math.pow(base, exponent)", displayText: "math.pow(base, exponent) - Power function" },
  { text: "math.sqrt(value)", displayText: "math.sqrt(value) - Square root" },
  { text: "math.exp(value)", displayText: "math.exp(value) - Exponential function" },
  { text: "math.pi", displayText: "math.pi - Pi constant (π)" },
  { text: "math.max(a, b)", displayText: "math.max(a, b) - Maximum of two values" },
  { text: "math.min(a, b)", displayText: "math.min(a, b) - Minimum of two values" },
  { text: "math.min_angle(value)", displayText: "math.min_angle(value) - Normalize angle to -π to π range" },
  { text: "math.asin(value)", displayText: "math.asin(value) - Arc sine" },
  { text: "math.acos(value)", displayText: "math.acos(value) - Arc cosine" },
  { text: "math.atan(value)", displayText: "math.atan(value) - Arc tangent" },
  { text: "math.atan2(y, x)", displayText: "math.atan2(y, x) - Arc tangent of y/x" },
  { text: "math.die_roll(num, low, high)", displayText: "math.die_roll(num, low, high) - Average of num random rolls" },
  { text: "math.die_roll_integer(num, low, high)", displayText: "math.die_roll_integer(num, low, high) - Average of num random integer rolls" },
  { text: "math.hermite_blend(value)", displayText: "math.hermite_blend(0 to 1) - Smooth step interpolation" },
  { text: "math.ln(value)", displayText: "math.ln(value) - Natural logarithm" },
  { text: "v.originx", displayText: "originx - Origin X position" },
  { text: "v.originz", displayText: "originz - Origin Z position" },
  { text: "return", displayText: "return - Value to display per pixel" },
];

// Custom hint function
CodeMirror.registerHelper("hint", "customHint", function (editor) {
  const cursor = editor.getCursor();
  const token = editor.getTokenAt(cursor);
  const start = token.start;
  const end = cursor.ch;
  const line = cursor.line;
  const currentWord = token.string.trim();

  // Filter hints based on current word
  const filteredHints = customHints.filter((hint) => hint.text.toLowerCase().includes(currentWord.toLowerCase()));

  return {
    list: filteredHints.length > 0 ? filteredHints : customHints,
    from: CodeMirror.Pos(line, start),
    to: CodeMirror.Pos(line, end),
  };
});

// Combine JavaScript and custom hints
CodeMirror.registerHelper("hint", "javascriptCustom", function (editor, options) {
  const jsHints = CodeMirror.hint.javascript(editor, options);
  const customHintsResult = CodeMirror.hint.customHint(editor, options);

  if (!jsHints && !customHintsResult) return null;
  if (!jsHints) return customHintsResult;
  if (!customHintsResult) return jsHints;

  return {
    list: jsHints.list.concat(customHintsResult.list),
    from: jsHints.from,
    to: jsHints.to,
  };
});

// Default starting code
const defaultCode = `// Generate a simple noise pattern
// Try modifying this code to create different patterns!

v.noise = q.noise(v.originx * 0.01, v.originz * 0.01);

// Return RGB color object
return v.noise > 0
  ? { 
      r: 0.55 + 0.45 * v.noise, 
      g: 0.55 + 0.45 * v.noise, 
      b: 0.55 + 0.45 * v.noise 
    }
  : { 
      r: 0.2, 
      g: 0.4 + 0.6 * -v.noise, 
      b: 1.0 + 0.0 * -v.noise 
    };`;

// localStorage functions for code persistence
function getSavedCode() {
  try {
    return localStorage.getItem('perlin-fiddle-code');
  } catch (e) {
    console.warn('Failed to load saved code:', e);
    return null;
  }
}

function saveCode(code) {
  try {
    localStorage.setItem('perlin-fiddle-code', code);
  } catch (e) {
    console.warn('Failed to save code:', e);
  }
}

// Share functionality
function generateShareLink(code) {
  // Compress the code using base64 encoding
  const encodedCode = btoa(encodeURIComponent(code));
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?code=${encodedCode}`;
}

function copyShareLink() {
  const currentCode = editor.getValue();
  const shareLink = generateShareLink(currentCode);
  
  // Copy to clipboard
  navigator.clipboard.writeText(shareLink).then(() => {
    // Show feedback (you could add a toast notification here)
    console.log('Share link copied to clipboard!');
    
    // Optional: Visual feedback on the button
    const shareButton = document.getElementById('share-button');
    const originalText = shareButton.querySelector('span').textContent;
    shareButton.querySelector('span').textContent = 'Copied!';
    shareButton.classList.add('bg-green-600');
    
    setTimeout(() => {
      shareButton.querySelector('span').textContent = originalText;
      shareButton.classList.remove('bg-green-600');
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy share link:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = shareLink;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  });
}

function loadCodeFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedCode = urlParams.get('code');
  
  if (encodedCode) {
    try {
      const decodedCode = decodeURIComponent(atob(encodedCode));
      return decodedCode;
    } catch (e) {
      console.error('Failed to decode code from URL:', e);
    }
  }
  return null;
}

// Initialize CodeMirror with Tailwind color scheme
const editor = CodeMirror(document.getElementById("code-input"), {
  mode: "javascript",
  theme: "material-darker",
  lineNumbers: true,
  lineWrapping: true,
  matchBrackets: true,
  autoCloseBrackets: true,
  indentUnit: 2,
  tabSize: 2,
  styleActiveLine: true,
  value: (() => {
    // Priority: 1. URL shared code, 2. localStorage saved code, 3. default code
    const sharedCode = loadCodeFromURL();
    if (sharedCode) {
      console.log('Code loaded from share link');
      // Clean up the URL to remove the code parameter
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return sharedCode;
    }
    return getSavedCode() || defaultCode;
  })(),
  extraKeys: {
    "Ctrl-Space": function (cm) {
      cm.showHint({
        hint: CodeMirror.hint.customHint,
        completeSingle: false,
      });
    },
  },
  hintOptions: {
    hint: CodeMirror.hint.javascriptCustom,
    completeSingle: false,
  },
});

// Make editor resize with its container
function resizeEditor() {
  editor.setSize(null, "100%");
}
window.addEventListener("resize", resizeEditor);
resizeEditor();

// Auto-save code when editor content changes
editor.on('change', (instance, change) => {
  const currentCode = instance.getValue();
  saveCode(currentCode);
});

// Set up share button event listener
document.getElementById('share-button')?.addEventListener('click', copyShareLink);

// Expose editor to global scope for other scripts
window.editor = editor;

// Define custom hints for autocomplete
const customHints = [
  {text: "noise", displayText: "noise(x, y) - Generate 2D noise"},
  {text: "random", displayText: "random() - Generate random number"},
  {text: "map", displayText: "map(value, start1, stop1, start2, stop2) - Map a value from one range to another"},
  {text: "constrain", displayText: "constrain(n, low, high) - Constrain a value between a minimum and maximum"},
  {text: "lerp", displayText: "lerp(start, stop, amt) - Linear interpolation"},
  {text: "dist", displayText: "dist(x1, y1, x2, y2) - Calculate distance between two points"},
  {text: "width", displayText: "width - Canvas width"},
  {text: "height", displayText: "height - Canvas height"},
  {text: "mouseX", displayText: "mouseX - Current mouse X position"},
  {text: "mouseY", displayText: "mouseY - Current mouse Y position"}
];

// Custom hint function
CodeMirror.registerHelper("hint", "customHint", function(editor) {
  const cursor = editor.getCursor();
  const token = editor.getTokenAt(cursor);
  const start = token.start;
  const end = cursor.ch;
  const line = cursor.line;
  const currentWord = token.string.trim();
  
  // Filter hints based on current word
  const filteredHints = customHints.filter(hint => 
    hint.text.toLowerCase().includes(currentWord.toLowerCase())
  );
  
  return {
    list: filteredHints.length > 0 ? filteredHints : customHints,
    from: CodeMirror.Pos(line, start),
    to: CodeMirror.Pos(line, end)
  };
});

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
  extraKeys: {
    "Ctrl-Space": function(cm) {
      // Try JavaScript hints first, fall back to custom hints
      CodeMirror.commands.autocomplete(cm, null, {
        completeSingle: false,
        hint: function() {
          const jsHints = CodeMirror.hint.javascript(cm);
          return jsHints || CodeMirror.hint.customHint(cm);
        }
      });
    }
  },
});

// Make editor resize with its container
function resizeEditor() {
  editor.setSize(null, "100%");
}
window.addEventListener("resize", resizeEditor);
resizeEditor();

// Expose editor to global scope for other scripts
window.editor = editor;

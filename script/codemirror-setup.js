// Define custom hints for autocomplete
const customHints = [
  { text: "q.noise(x, y)", displayText: "noise(x, y) - 2D perlin noise" },
  {
    text: "math.random(min,max)",
  },
  {
    text: "math.lerp(start, stop, t)",
    displayText: "math.lerp(start, stop, 0 to 1) - Linear interpolation",
  },
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
  const filteredHints = customHints.filter((hint) =>
    hint.text.toLowerCase().includes(currentWord.toLowerCase())
  );

  return {
    list: filteredHints.length > 0 ? filteredHints : customHints,
    from: CodeMirror.Pos(line, start),
    to: CodeMirror.Pos(line, end),
  };
});

// Combine JavaScript and custom hints
// CodeMirror.registerHelper(
//   "hint",
//   "javascriptCustom",
//   function (editor, options) {
//     const jsHints = CodeMirror.hint.javascript(editor, options);
//     const customHintsResult = CodeMirror.hint.customHint(editor, options);

//     if (!jsHints && !customHintsResult) return null;
//     if (!jsHints) return customHintsResult;
//     if (!customHintsResult) return jsHints;

//     return {
//       list: jsHints.list.concat(customHintsResult.list),
//       from: jsHints.from,
//       to: jsHints.to,
//     };
//   }
// );

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

// Expose editor to global scope for other scripts
window.editor = editor;

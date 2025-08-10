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
    "Ctrl-Space": "autocomplete",
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

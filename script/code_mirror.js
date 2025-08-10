// Initialize CodeMirror editor
let codeEditor;

window.addEventListener("load", function () {
  const textarea = document.getElementById("mathInput");

  // Only use saved code or default code
  const savedCode = localStorage.getItem("perlinFiddleCode");
  const defaultCode = "";
  const codeToUse = savedCode || defaultCode;
  textarea.value = codeToUse;

  codeEditor = CodeMirror(document.getElementById("codeEditor"), {
    value: codeToUse,
    mode: "javascript",
    theme: "monokai",
    lineNumbers: true,
    indentUnit: 2,
    tabSize: 2,
    indentWithTabs: false,
    lineWrapping: true,
    autoCloseBrackets: false,
    matchBrackets: true,
    styleActiveLine: true,
    viewportMargin: Infinity,
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    hintOptions: {
      completeSingle: false,
      hint: function (cm) {
        // Custom autocomplete for your math functions
        const cursor = cm.getCursor();
        const token = cm.getTokenAt(cursor);
        const start = token.start;
        const end = cursor.ch;
        const word = token.string.slice(0, end - start);

        const mathFunctions = [
          "math.abs()",
          "math.sin()",
          "math.cos()",
          "math.clamp()",
          "math.ceil()",
          "math.floor()",
          "math.trunc()",
          "math.round()",
          "math.mod()",
          "math.pow()",
          "math.sqrt()",
          "math.exp()",
          "math.pi",
          "math.max()",
          "math.min()",
          "math.min_angle()",
          "math.asin()",
          "math.acos()",
          "math.atan()",
          "math.atan2()",
          "math.random()",
          "math.random_integer()",
          "q.noise()",
          "math.die_roll()",
          "math.die_roll_integer()",
          "math.hermite_blend()",
          "math.lerp()",
          "math.lerprotate()",
          "math.ln()",
          "return",
        ];

        const variables = ["x", "y", "v.originx", "v.originz", "v.worldx", "v.worldz"];

        const allCompletions = [...mathFunctions, ...variables];

        return {
          list: allCompletions,
          from: CodeMirror.Pos(cursor.line, start),
          to: CodeMirror.Pos(cursor.line, end),
        };
      },
    },
    extraKeys: {
      "Ctrl-Enter": function (cm) {
        updateExpression();
      },
      "Cmd-Enter": function (cm) {
        updateExpression();
      },
      "Ctrl-Space": "autocomplete",
      "Ctrl-/": "toggleComment",
      "Cmd-/": "toggleComment",
      "Ctrl-F": "findPersistent",
      "Cmd-F": "findPersistent",
      F11: function (cm) {
        cm.setOption("fullScreen", !cm.getOption("fullScreen"));
      },
      Esc: function (cm) {
        if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
      },
    },
  });

  // Save code to localStorage whenever it changes
  codeEditor.on("change", function (cm) {
    localStorage.setItem("perlinFiddleCode", cm.getValue());
  });

  // Load saved input values
  const savedWorldSize = localStorage.getItem("perlinFiddleWorldSize");
  const savedGridSize = localStorage.getItem("perlinFiddleGridSize");
  const savedGridColor = localStorage.getItem("perlinFiddleGridColor");

  if (savedWorldSize) {
    document.getElementById("resolutionInput").value = savedWorldSize;
  }
  if (savedGridSize) {
    document.getElementById("gridSizeInput").value = savedGridSize;
  }
  if (savedGridColor) {
    document.getElementById("gridColorInput").value = savedGridColor;
  }

  // Resize CodeMirror when window resizes
  window.addEventListener("resize", function () {
    setTimeout(function () {
      if (codeEditor) {
        codeEditor.refresh();
      }
    }, 100);
  });

  // Add event listener for grid size input
  const gridSizeInput = document.getElementById("gridSizeInput");
  if (gridSizeInput) {
    gridSizeInput.addEventListener("input", function () {
      localStorage.setItem("perlinFiddleGridSize", this.value);
      // Grid changes are handled in the draw loop, no need to regenerate terrain
    });
  }

  // Add event listener for grid color input
  const gridColorInput = document.getElementById("gridColorInput");
  if (gridColorInput) {
    gridColorInput.addEventListener("input", function () {
      localStorage.setItem("perlinFiddleGridColor", this.value);
      // Grid changes are handled in the draw loop, no need to regenerate terrain
    });
  }
});

function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: ${type === "error" ? "#ff4444" : "#4CAF50"};
          color: white;
          padding: 12px 20px;
          border-radius: 6px;
          font-family: monospace;
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
        `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS for animations
const style = document.createElement("style");
style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
document.head.appendChild(style);

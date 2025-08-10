// Copy Molang button logic
document.addEventListener("DOMContentLoaded", function () {
  const copyBtn = document.getElementById("copyMolangBtn");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      let code = "";
      if (window.codeEditor) {
        code = codeEditor.getValue();
      } else {
        code = document.getElementById("mathInput").value;
      }
      // Remove all // and /* */ comments and whitespace lines
      let noBlock = code.replace(/\/\*[\s\S]*?\*\//g, ""); // Remove /* ... */
      let noLine = noBlock.replace(/\/\/.*$/gm, ""); // Remove // ...
      let lines = noLine
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line);
      // Join lines, but keep object literals and ternaries together
      let joined = lines.join(" ");
      // Remove semicolons after commas in object literals
      joined = joined.replace(/,;/g, ",");
      // Remove multiple spaces
      joined = joined.replace(/\s+/g, " ");
      // Add semicolons at the end of statements if missing (but not after { or })
      joined = joined.replace(/([^;{}])\s*(?=(let|const|var|return|if|for|while|function|$))/g, "$1; ");
      // Remove semicolons before }
      joined = joined.replace(/;(\s*})/g, "$1");
      // Remove semicolons after { or before ,
      joined = joined.replace(/({|,)\s*;/g, "$1");
      // Remove semicolons before ?
      joined = joined.replace(/;\s*\?/g, " ?");
      // Remove semicolons before :
      joined = joined.replace(/;\s*:/g, " :");
      // Remove semicolons before ,
      joined = joined.replace(/;\s*,/g, ",");
      // Remove duplicate semicolons
      joined = joined.replace(/;;+/g, ";");
      // Copy to clipboard
      navigator.clipboard.writeText(joined.trim()).then(
        () => {
          showNotification("Molang copied to clipboard!", "success");
        },
        () => {
          showNotification("Failed to copy Molang.", "error");
        }
      );
    });
  }
});

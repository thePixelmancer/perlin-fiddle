
document.addEventListener("DOMContentLoaded", function () {
  const exampleSelect = document.getElementById("exampleSelect");
  if (exampleSelect) {
    exampleSelect.addEventListener("change", function () {
      const filename = this.value;
      if (!filename) return;
      fetch(`./fiddles/${filename}`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to load example");
          return response.text();
        })
        .then((code) => {
          if (window.codeEditor) {
            codeEditor.setValue(code);
          } else {
            document.getElementById("mathInput").value = code;
          }
          localStorage.setItem("perlinFiddleCode", code);
          updateExpression();
        })
        .catch((err) => {
          showNotification("Could not load example: " + err.message, "error");
        });
      // Reset dropdown to placeholder
      setTimeout(() => {
        this.value = "";
      }, 500);
    });
  }
});

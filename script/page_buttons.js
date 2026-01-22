document.addEventListener("DOMContentLoaded", () => {
  const tabsContainer = document.getElementById("tabs");
  const tabButtons = document.querySelectorAll(".tab-button");
  const codeInput = document.getElementById("code-input");
  const documentation = document.getElementById("documentation");

  // Initialize with Molang Editor active
  codeInput.classList.remove("hidden");
  documentation.classList.add("hidden");

  tabsContainer.addEventListener("click", (e) => {
    const clickedTab = e.target.closest(".tab-button");
    if (!clickedTab) return;

    // Update tab button styles
    tabButtons.forEach((btn) => {
      if (btn === clickedTab) {
        btn.classList.add("text-cyan-400", "border-cyan-400");
        btn.classList.remove("text-gray-400", "border-transparent");
      } else {
        btn.classList.remove("text-cyan-400", "border-cyan-400");
        btn.classList.add("text-gray-400", "border-transparent");
      }
    });

    // Toggle sections based on which tab was clicked
    if (clickedTab.textContent.trim() === "Molang Editor") {
      codeInput.classList.remove("hidden");
      documentation.classList.add("hidden");
    } else if (clickedTab.textContent.trim() === "Documentation") {
      codeInput.classList.add("hidden");
      documentation.classList.remove("hidden");
    }
  });
});
// Set up world size input validation and warning
document.getElementById("worldSizeInput")?.addEventListener("input", (event) => {
  const input = event.target;
  const value = parseInt(input.value);

  if (value > 2048) {
    input.classList.remove("border-gray-700");
    input.classList.remove("focus:border-cyan-700");
    input.classList.add("border-yellow-700");
    input.classList.add("focus:border-yellow-700");
  } else {
    input.classList.remove("border-yellow-700");
    input.classList.remove("focus:border-yellow-700");
    input.classList.add("border-gray-700");
    input.classList.add("focus:border-cyan-700");
  }
});

// Set up the copy molang button
document.getElementById("copy-molang-button")?.addEventListener("click", () => {
  if (window.editor) {
    const codeText = window.editor.getValue();

    // Use the modern Clipboard API
    navigator.clipboard
      .writeText(codeText)
      .then(() => {
        // Show feedback to user
        const button = document.getElementById("copy-molang-button");
        const originalText = button.querySelector("span").textContent;
        button.querySelector("span").textContent = "Copied!";

        // Reset button text after 2 seconds
        setTimeout(() => {
          button.querySelector("span").textContent = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        // Show error feedback to user
        const button = document.getElementById("copy-molang-button");
        const originalText = button.querySelector("span").textContent;
        button.querySelector("span").textContent = "Copy Failed";

        // Reset button text after 2 seconds
        setTimeout(() => {
          button.querySelector("span").textContent = originalText;
        }, 2000);
      });
  }
});

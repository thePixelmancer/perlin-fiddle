document.addEventListener("DOMContentLoaded", () => {
  const tabsContainer = document.getElementById("tabs");
  const tabButtons = document.querySelectorAll(".tab-button");
  const codeInput = document.getElementById("code-input");
  const documentation = document.getElementById("documentation");

  // Hide documentation by default
  documentation.style.display = "none";

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
      codeInput.style.display = "block";
      documentation.style.display = "none";
    } else if (clickedTab.textContent.trim() === "Documentation") {
      codeInput.style.display = "none";
      documentation.style.display = "block";
    }
  });
});

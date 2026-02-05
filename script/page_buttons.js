document.addEventListener("DOMContentLoaded", () => {
  const tabsContainer = document.getElementById("tabs");
  const tabButtons = document.querySelectorAll(".tab-button");
  const codeInput = document.getElementById("code-input");
  const documentation = document.getElementById("documentation");

  // Initialize with Molang Editor active
  codeInput.classList.remove("hidden");
  documentation.classList.add("hidden");

  tabsContainer.addEventListener("click", async (e) => {
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

      // Fetch documentation HTML if not already loaded
      if (documentation.innerHTML.trim() === "") {
        try {
          const response = await fetch("./documentation.html");
          if (response.ok) {
            const html = await response.text();
            // Extract the body content (everything inside the body tags)
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, "text/html");
            const bodyContent = doc.body.innerHTML;
            documentation.innerHTML = bodyContent;
          }
        } catch (error) {
          console.error("Error loading documentation:", error);
          documentation.innerHTML = "<p class='p-6 text-red-400'>Error loading documentation.</p>";
        }
      }
    }
  });

  // Automatically populate example dropdown
  async function populateExamples() {
    const exampleSelect = document.getElementById("exampleSelect");
    if (!exampleSelect) return;

    try {
      // Fetch the directory listing (this requires a server that supports directory listing)
      // For now, we'll use a predefined list of known examples
      const knownExamples = [
        "scattered_islands.js",
        "terrain.js", 
        "ridges.js",
        "hex_grid.js",
        "mountain_slopes.js",
        "shaded_mountain.js",
        "damascus.js"
      ];

      // Clear existing options except the first one
      exampleSelect.innerHTML = '<option value="">Load Example...</option>';

      // Try to load each example and add it to the dropdown if it exists
      for (const example of knownExamples) {
        try {
          const response = await fetch(`./fiddles/${example}`);
          if (response.ok) {
            // Create a readable name from filename
            const displayName = example
              .replace('.js', '')
              .replace(/_/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
            
            const option = document.createElement('option');
            option.value = example;
            option.textContent = displayName;
            exampleSelect.appendChild(option);
          }
        } catch (err) {
          // Skip files that don't exist or can't be loaded
          console.log(`Skipping ${example}: ${err.message}`);
        }
      }
    } catch (error) {
      console.error("Error populating examples:", error);
    }
  }

  // Populate examples when DOM is loaded
  populateExamples();
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
        button.classList.add('bg-green-600');

        // Reset button text and color after 2 seconds
        setTimeout(() => {
          button.querySelector("span").textContent = originalText;
          button.classList.remove('bg-green-600');
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

// Set up example loading
document.getElementById("exampleSelect")?.addEventListener("change", async (event) => {
  const selectedExample = event.target.value;
  
  if (!selectedExample) return; // No example selected
  
  try {
    const response = await fetch(`./fiddles/${selectedExample}`);
    if (!response.ok) {
      throw new Error(`Failed to load example: ${response.statusText}`);
    }
    
    const exampleCode = await response.text();
    
    // Load the example code into the editor
    if (window.editor) {
      window.editor.setValue(exampleCode);
      console.log(`Loaded example: ${selectedExample}`);
    }
  } catch (error) {
    console.error("Error loading example:", error);
    // Show error feedback to user
    const select = document.getElementById("exampleSelect");
    const originalValue = select.value;
    select.value = ""; // Reset to default option
    
    // You could add a toast notification here if you have one
    alert(`Failed to load example: ${error.message}`);
  }
  
  // Reset the select to default option after loading
  setTimeout(() => {
    event.target.value = "";
  }, 100);
});

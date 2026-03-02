// Initialize learning mode toggle
const learningModeCheckbox = document.getElementById("learningMode");

// Store current translation data
let currentTranslation = {
  plainText: "",
  learningText: "",
  isError: false
};

// Load saved learning mode preference
chrome.storage.sync.get(["learningMode"], (result) => {
  learningModeCheckbox.checked = result.learningMode !== false; // Default to true
  updateDisplay();
});

// Save learning mode preference when changed and update display
learningModeCheckbox.addEventListener("change", () => {
  chrome.storage.sync.set({ learningMode: learningModeCheckbox.checked });
  updateDisplay();
});

// Listen for translation result from background script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "translationResult") {
    currentTranslation = {
      plainText: msg.plainText,
      learningText: msg.learningText,
      isError: msg.isError
    };
    updateDisplay();
  }
});

// Request the translation result when popup opens
chrome.runtime.sendMessage({ type: "getTranslation" }, (response) => {
  if (response) {
    currentTranslation = {
      plainText: response.plainText,
      learningText: response.learningText,
      isError: response.isError
    };
    updateDisplay();
  }
});

function updateDisplay() {
  const loading = document.getElementById("loading");
  const result = document.getElementById("result");

  loading.style.display = "none";
  result.style.display = "block";

  const learningMode = learningModeCheckbox.checked;

  if (learningMode) {
    // Use innerHTML to render furigana ruby tags
    result.innerHTML = currentTranslation.learningText;
  } else {
    // Use textContent for plain text
    result.textContent = currentTranslation.plainText;
  }

  if (currentTranslation.isError) {
    result.classList.add("error");
  } else {
    result.classList.remove("error");
  }
}

// Listen for translation result from background script
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "translationResult") {
    displayResult(msg.text, msg.isError);
  }
});

// Request the translation result when popup opens
chrome.runtime.sendMessage({ type: "getTranslation" }, (response) => {
  if (response) {
    displayResult(response.text, response.isError);
  }
});

function displayResult(text, isError = false) {
  const loading = document.getElementById("loading");
  const result = document.getElementById("result");

  loading.style.display = "none";
  result.style.display = "block";
  result.textContent = text;

  if (isError) {
    result.classList.add("error");
  }
}

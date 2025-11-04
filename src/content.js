chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "showTranslation") {
    showPopup(msg.text);
  }
});

function showPopup(text) {
  const existing = document.getElementById("translate-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "translate-popup";
  popup.textContent = text;

  popup.style.position = "fixed";
  popup.style.bottom = "20px";
  popup.style.right = "20px";
  popup.style.background = "rgba(0,0,0,0.8)";
  popup.style.color = "#fff";
  popup.style.padding = "10px 14px";
  popup.style.borderRadius = "8px";
  popup.style.fontSize = "14px";
  popup.style.zIndex = "999999";
  popup.style.maxWidth = "300px";
  popup.style.lineHeight = "1.4";
  popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  popup.style.cursor = "pointer";

  popup.addEventListener("click", () => popup.remove());

  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 7000);
}

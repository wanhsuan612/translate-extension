importScripts("config.js");

// Store the latest translation result
let latestTranslation = {
  text: "尚未進行翻譯",
  isError: false
};

chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu
  chrome.contextMenus.create({
    id: "translateParent",
    title: "翻譯選取文字 (Gemini)",
    contexts: ["selection"]
  });

  // Create submenu for translating to Japanese
  chrome.contextMenus.create({
    id: "translateToJapanese",
    parentId: "translateParent",
    title: "日本語に翻訳",
    contexts: ["selection"]
  });

  // Create submenu for translating to Chinese
  chrome.contextMenus.create({
    id: "translateToChinese",
    parentId: "translateParent",
    title: "翻譯成繁體中文",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  const isTranslateMenu = info.menuItemId === "translateToJapanese" || info.menuItemId === "translateToChinese";

  if (isTranslateMenu && info.selectionText) {
    const text = info.selectionText.trim();
    const targetLang = info.menuItemId === "translateToJapanese" ? "Japanese" : "Traditional Chinese";

    // Open the popup
    chrome.action.openPopup();

    // Set initial state
    latestTranslation = {
      text: "正在翻譯中...",
      isError: false
    };

    // Perform translation
    const result = await translateWithGemini(text, targetLang);

    // Store the result
    latestTranslation = {
      text: result,
      isError: result.includes("翻譯失敗") || result.includes("無法取得翻譯結果")
    };

    // Send result to any open popup windows
    chrome.runtime.sendMessage({
      type: "translationResult",
      text: latestTranslation.text,
      isError: latestTranslation.isError
    }).catch(() => {
      // Popup might not be open yet, that's fine
    });
  }
});

// Handle requests from popup for translation data
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "getTranslation") {
    sendResponse(latestTranslation);
  }
  return true;
});

async function translateWithGemini(text, targetLang) {
  const prompt = `Translate the following text into ${targetLang}.
If the input already contains both languages, only translate the part that is not in ${targetLang}.
IMPORTANT: Do NOT translate proper nouns (names of people, organizations, brands, locations, book/movie titles, product names) or technical terms. Keep them exactly as they appear in the source text.
Only return the translated text, nothing else.

Text: """${text}"""`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
        GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "(無法取得翻譯結果)";
  } catch (err) {
    console.error("Gemini translation error:", err);
    return "(翻譯失敗)";
  }
}

importScripts("config.js");

// Store the latest translation result with both versions
let latestTranslation = {
  plainText: "尚未進行翻譯 / まだ翻訳されていません",
  learningText: "尚未進行翻譯 / まだ翻訳されていません",
  isError: false
};

chrome.runtime.onInstalled.addListener(() => {
  // Create parent menu
  chrome.contextMenus.create({
    id: "translateParent",
    title: "翻譯選取文字 / 選択したテキストを翻訳 (Gemini)",
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
    const isJapanese = info.menuItemId === "translateToJapanese";
    const loadingText = isJapanese ? "翻訳中..." : "正在翻譯中...";
    latestTranslation = {
      plainText: loadingText,
      learningText: loadingText,
      isError: false
    };

    // Perform translation (always get both versions)
    const result = await translateWithGemini(text, targetLang);

    // Store the result
    const errorKeywords = ["翻譯失敗", "無法取得翻譯結果", "翻訳失敗", "翻訳結果を取得できません"];
    const isError = errorKeywords.some(keyword =>
      result.plainText.includes(keyword) || result.learningText.includes(keyword)
    );

    latestTranslation = {
      plainText: result.plainText,
      learningText: result.learningText,
      isError: isError
    };

    // Send result to any open popup windows
    chrome.runtime.sendMessage({
      type: "translationResult",
      plainText: latestTranslation.plainText,
      learningText: latestTranslation.learningText,
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
  const isJapanese = targetLang === "Japanese";

  let prompt;
  if (isJapanese) {
    // Chinese → Japanese: Get both versions
    prompt = `Translate the following text into Japanese.
IMPORTANT: Do NOT translate proper nouns (names of people, organizations, brands, locations, book/movie titles, product names) or technical terms. Keep them exactly as they appear in the source text.

Provide TWO versions of the Japanese translation:
1. Plain version: Japanese text without furigana
2. Learning version: Japanese text with furigana readings for kanji in the format 漢字[かんじ]

Return in this EXACT format:
PLAIN: [Japanese translation without furigana]
LEARNING: [Japanese translation with furigana]

Example output format:
PLAIN: 私は学生です
LEARNING: 私[わたし]は学生[がくせい]です

Text: """${text}"""`;
  } else {
    // Japanese → Chinese: Get translation and original with furigana
    prompt = `The following text is in Japanese. Provide:
1. Traditional Chinese translation
2. The original Japanese text with furigana readings added to kanji in the format 漢字[かんじ]

IMPORTANT: Do NOT translate proper nouns (names of people, organizations, brands, locations, book/movie titles, product names) or technical terms. Keep them exactly as they appear in the source text.

Return in this EXACT format:
PLAIN: [Traditional Chinese translation only]
LEARNING: [Original Japanese text with furigana added]

Example output format:
PLAIN: 我是學生
LEARNING: 私[わたし]は学生[がくせい]です

Text: """${text}"""`;
  }

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
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!rawText) {
      const errorMsg = isJapanese ? "(翻訳結果を取得できません)" : "(無法取得翻譯結果)";
      return { plainText: errorMsg, learningText: errorMsg };
    }

    // Parse the response to extract both versions
    return parseTranslationResponse(rawText);
  } catch (err) {
    console.error("Gemini translation error:", err);
    const errorMsg = isJapanese ? "(翻訳失敗)" : "(翻譯失敗)";
    return { plainText: errorMsg, learningText: errorMsg };
  }
}

function parseTranslationResponse(rawText) {
  // Extract PLAIN and LEARNING sections
  const plainMatch = rawText.match(/PLAIN:\s*(.+?)(?=\nLEARNING:|$)/s);
  const learningMatch = rawText.match(/LEARNING:\s*(.+?)$/s);

  let plainText = plainMatch ? plainMatch[1].trim() : rawText;
  let learningText = learningMatch ? learningMatch[1].trim() : rawText;

  // Convert furigana notation to HTML ruby tags in learning version
  learningText = convertFuriganaToHTML(learningText);

  return { plainText, learningText };
}

function convertFuriganaToHTML(text) {
  // Convert 漢字[かんじ] format to <ruby>漢字<rt>かんじ</rt></ruby>
  return text.replace(/([一-龯々〆ヵヶ]+)\[([ぁ-ん]+)\]/g, '<ruby>$1<rt>$2</rt></ruby>');
}

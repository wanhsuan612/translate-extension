# Auto Translate Selection (zh-TW↔JP)

A Chrome extension that enables quick translation between Traditional Chinese and Japanese using Google's Gemini AI model.

## Features

- **Context Menu Translation**: Right-click on any selected text to translate it
- **Bidirectional Translation**: Translate from Traditional Chinese to Japanese or vice versa
- **Smart Translation**: Preserves proper nouns, names, brands, and technical terms
- **Mixed Language Support**: Automatically handles text containing both languages
- **Popup Display**: View translations in a clean, easy-to-read popup
- **Powered by Gemini**: Uses Google's Gemini 2.5 Flash model for accurate translations

## Installation

### Option 1: Quick Setup with Script (Easiest - Recommended)

**Prerequisites:**
- Google Chrome browser
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

**Setup Steps:**

1. **Download or clone this repository**
   ```bash
   git clone <repository-url>
   cd translate-extension
   ```

2. **Run the setup script**

   **On macOS/Linux:**
   ```bash
   ./setup.sh
   ```

   **On Windows (Git Bash or WSL):**
   ```bash
   bash setup.sh
   ```

   The script will:
   - Prompt you to enter your Gemini API key
   - Create the `config.js` file automatically
   - Open Chrome extensions page for you

3. **Load the extension in Chrome**
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the `src` folder inside `translate-extension`
   - The extension should now appear in your extensions list

### Option 2: Download Release

**Prerequisites:**
- Google Chrome browser
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

**Setup Steps:**

1. **Download the latest release**
   - Go to the [Releases page](../../releases)
   - Download the latest `extension.zip` file
   - Extract the ZIP file to a folder on your computer

2. **Run the setup script**

   **On macOS/Linux:**
   ```bash
   cd path/to/extracted/folder
   ./setup.sh
   ```

   **On Windows (Git Bash or WSL):**
   ```bash
   cd path/to/extracted/folder
   bash setup.sh
   ```

   Follow the prompts to configure your API key

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the `src` folder inside the extracted folder
   - The extension should now appear in your extensions list

### Option 3: Manual Installation (No Script)

**Prerequisites:**
- Google Chrome browser
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

**Setup Steps:**

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd translate-extension
   ```

2. **Configure your API key manually**
   - Copy `src/config.js.example` to `src/config.js`:
     ```bash
     cp src/config.js.example src/config.js
     ```
   - Open [src/config.js](src/config.js) and replace `YOUR-GEMINI-API-KEY` with your actual Gemini API key:
     ```javascript
     const GEMINI_API_KEY = "your-actual-api-key-here";
     ```

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in the top right)
   - Click "Load unpacked"
   - Select the `src` folder inside `translate-extension`
   - The extension should now appear in your extensions list

## Usage

### Method 1: Context Menu (Right-click)

1. Select any text on a webpage
2. Right-click to open the context menu
3. Hover over "翻譯選取文字 (Gemini)"
4. Choose either:
   - **日本語に翻訳** (Translate to Japanese)
   - **翻譯成繁體中文** (Translate to Traditional Chinese)
5. A popup will open showing the translation

### Method 2: Extension Popup

- Click the extension icon in the Chrome toolbar to view the most recent translation

## Project Structure

```
translate-extension/
├── src/                    # Extension source files
│   ├── manifest.json       # Extension configuration
│   ├── background.js       # Background service worker (handles translation logic)
│   ├── content.js          # Content script (displays in-page popups)
│   ├── popup.html          # Popup UI structure
│   ├── popup.js            # Popup UI logic
│   ├── config.js           # API key configuration (gitignored, created by setup)
│   ├── config.js.example   # Example config file
│   └── icons/
│       └── icon-128.png    # Extension icon
├── setup.sh                # Setup script (bash) - Recommended
├── README.md               # Documentation
└── .gitignore              # Git ignore rules
```

## Key Components

### Background Service Worker ([src/background.js](src/background.js))
- Creates context menu items
- Handles translation requests to Gemini API
- Manages translation state
- Communicates with popup

### Content Script ([src/content.js](src/content.js))
- Displays temporary translation popups on the page
- Auto-dismisses after 7 seconds
- Click to dismiss manually

### Popup ([src/popup.html](src/popup.html), [src/popup.js](src/popup.js))
- Shows translation results in a dedicated popup window
- Displays loading state during translation
- Shows error messages if translation fails

## Translation Behavior

The extension uses intelligent prompts to ensure quality translations:

- **Proper Noun Preservation**: Names, brands, locations, and titles remain unchanged
- **Technical Term Handling**: Technical vocabulary is preserved
- **Mixed Language Detection**: Automatically identifies and translates only the necessary portions
- **Context-Aware**: Uses Gemini AI for natural, contextually appropriate translations

## Configuration

### API Settings

The extension uses Gemini 2.5 Flash model. You can modify the model in [src/background.js:91](src/background.js#L91):

```javascript
const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY,
  // ...
);
```

### Popup Display Duration

In-page popups display for 7 seconds by default. Modify in [src/content.js:32](src/content.js#L32):

```javascript
setTimeout(() => popup.remove(), 7000); // Change 7000 to desired milliseconds
```

## Security Notes

- **Never commit your API key**: The `config.js` file is gitignored to prevent accidental exposure
- **API Key Protection**: Keep your Gemini API key secure and never share it publicly
- **Rate Limits**: Be aware of Gemini API rate limits and quotas

## Permissions

The extension requires the following permissions:

- `activeTab`: Access to the current tab for reading selected text
- `scripting`: Inject content scripts for displaying popups
- `contextMenus`: Add translation options to right-click menu

## Troubleshooting

### Translation not working
- Verify your API key is correctly set in [src/config.js](src/config.js)
- Check the browser console for error messages (F12 → Console)
- Ensure you have an active internet connection

### Context menu not appearing
- Make sure text is selected before right-clicking
- Try reloading the extension in `chrome://extensions/`

### API errors
- Check your Gemini API key is valid
- Verify you haven't exceeded API rate limits
- Ensure the API key has the necessary permissions

## Development

To modify the extension:

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

## Contributing

Contributions are welcome! Whether you're fixing bugs, adding new features, improving documentation, or suggesting enhancements, your help is appreciated.

### How to Contribute

1. **Fork the repository**
   - Click the "Fork" button at the top of this repository

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clean, well-documented code
   - Follow the existing code style
   - Test your changes thoroughly

4. **Commit your changes**
   ```bash
   git commit -m "Add: brief description of your changes"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Describe your changes and why they're needed

### Ideas for Contributions

- Add support for more languages
- Improve translation accuracy with better prompts
- Add keyboard shortcuts for quick translation
- Create an options page for customization
- Improve UI/UX of the popup
- Add translation history
- Implement offline caching
- Write unit tests
- Improve documentation

### Guidelines

- Keep changes focused and atomic
- Update documentation if you change functionality
- Test on Chrome before submitting
- Be respectful and constructive in discussions
- Don't commit API keys or sensitive information

We appreciate all contributions, big or small!

## Credits

Built with:
- Google Gemini API
- Chrome Extensions Manifest V3

## Support

For issues or feature requests, please [open an issue](../../issues) on the repository.

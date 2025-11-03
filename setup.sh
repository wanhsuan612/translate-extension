#!/bin/bash

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SRC_DIR="$SCRIPT_DIR/src"
CONFIG_FILE="$SRC_DIR/config.js"

echo ""
echo -e "${BLUE}🚀 Auto Translate Extension Setup${NC}"
echo "====================================="
echo ""

# Check if config.js already exists
if [ -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}⚠️  config.js already exists.${NC}"
    read -p "Do you want to overwrite it? (y/n): " overwrite
    if [[ ! "$overwrite" =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Setup cancelled.${NC}"
        exit 0
    fi
    echo ""
fi

# Step 1: Get API key
echo -e "${BLUE}Step 1: Configure Gemini API Key${NC}"
echo "Get your API key from: https://makersuite.google.com/app/apikey"
echo ""

while true; do
    read -p "Please enter your Gemini API key: " api_key
    # Trim whitespace
    api_key=$(echo "$api_key" | xargs)

    if [ -z "$api_key" ]; then
        echo -e "${RED}❌ API key cannot be empty. Please try again.${NC}"
        echo ""
    else
        break
    fi
done

# Step 2: Create config file
echo ""
echo -e "${BLUE}Step 2: Creating configuration file...${NC}"

cat > "$CONFIG_FILE" << EOF
const GEMINI_API_KEY = "$api_key";
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ config.js created successfully!${NC}"
else
    echo -e "${RED}❌ Error creating config.js${NC}"
    exit 1
fi

# Step 3: Instructions for loading extension
echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps (Manual Actions Required):${NC}"
echo "1. Open Google Chrome"
echo "2. Navigate to: chrome://extensions/"
echo -e "${YELLOW}3. [ACTION REQUIRED] Enable 'Developer mode' (toggle in the top right)${NC}"
echo -e "${YELLOW}4. [ACTION REQUIRED] Click 'Load unpacked'${NC}"
echo -e "${YELLOW}5. [ACTION REQUIRED] Select the 'src' folder: $SRC_DIR${NC}"
echo "6. The extension should now be loaded!"
echo ""

# Ask if user wants to open Chrome
read -p "Would you like to open Chrome extensions page now? (y/n): " open_chrome

if [[ "$open_chrome" =~ ^[Yy]$ ]]; then
    echo ""

    # Detect OS and open Chrome accordingly
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        open -a "Google Chrome" "chrome://extensions/" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Opening Chrome extensions page...${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not automatically open Chrome.${NC}"
            echo "Please manually open Chrome and navigate to: chrome://extensions/"
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows (Git Bash or similar)
        start chrome "chrome://extensions/" 2>/dev/null
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Opening Chrome extensions page...${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not automatically open Chrome.${NC}"
            echo "Please manually open Chrome and navigate to: chrome://extensions/"
        fi
    else
        # Linux
        if command -v google-chrome &> /dev/null; then
            google-chrome "chrome://extensions/" 2>/dev/null &
            echo -e "${GREEN}✅ Opening Chrome extensions page...${NC}"
        elif command -v chromium &> /dev/null; then
            chromium "chrome://extensions/" 2>/dev/null &
            echo -e "${GREEN}✅ Opening Chrome extensions page...${NC}"
        elif command -v chromium-browser &> /dev/null; then
            chromium-browser "chrome://extensions/" 2>/dev/null &
            echo -e "${GREEN}✅ Opening Chrome extensions page...${NC}"
        else
            echo -e "${YELLOW}⚠️  Could not find Chrome/Chromium.${NC}"
            echo "Please manually open Chrome and navigate to: chrome://extensions/"
        fi
    fi

    echo ""
    echo -e "${BLUE}ℹ️  If the extensions page didn't load automatically,${NC}"
    echo "   manually navigate to: chrome://extensions/"
else
    echo ""
    echo -e "${BLUE}ℹ️  When ready, open Chrome and navigate to: chrome://extensions/${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Thank you for using Auto Translate Extension!${NC}"
echo ""
echo -e "${BLUE}Press Enter to close this window...${NC}"
read -r

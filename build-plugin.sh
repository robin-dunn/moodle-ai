#!/bin/bash

# Build and package ShowMyAI plugin
# This script installs dependencies, builds the AMD modules, and creates a distribution zip

set -e  # Exit on error

PLUGIN_DIR="plugins/showmyai"
OUTPUT_ZIP="plugin_showmyai.zip"

echo "Building ShowMyAI plugin..."
echo ""

# Navigate to plugin directory
cd "$PLUGIN_DIR"

# Install dependencies
echo "Installing npm dependencies..."
npm install

echo ""
echo "Building AMD modules..."
npm run build

# Return to root
cd ../..

echo ""
echo "Creating distribution package..."

# Remove old zip if it exists
rm -f "$OUTPUT_ZIP"

# Create zip with correct structure for Moodle
# The zip should have showmyai/* at the root, not plugins/showmyai/*
cd plugins
zip -r "../$OUTPUT_ZIP" showmyai \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/package-lock.json" \
  -x "*/.gitignore" \
  -x "*/.grunt/*" \
  -x "*/.vscode/*" \
  -x "*/.idea/*" \
  -x "*.swp" \
  -x "*.swo"
cd ..

echo ""
echo "Build complete! Plugin is ready to use."
echo ""
echo "Distribution package created: $OUTPUT_ZIP"
echo "File size: $(du -h "$OUTPUT_ZIP" | cut -f1)"
echo ""
echo "To install in Moodle:"
echo "  1. Go to Site administration > Plugins > Install plugins"
echo "  2. Upload $OUTPUT_ZIP"
echo "  3. Select plugin type: 'Local plugins (local)'"
echo "  4. Click 'Install plugin from the ZIP file'"
echo ""
echo "Or for local development:"
echo "  - Run: docker compose up"

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

# Create zip excluding development files
zip -r "$OUTPUT_ZIP" "$PLUGIN_DIR" \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/package-lock.json" \
  -x "*/.gitignore" \
  -x "*/.grunt/*" \
  -x "*/.vscode/*" \
  -x "*/.idea/*" \
  -x "*.swp" \
  -x "*.swo"

echo ""
echo "Build complete! Plugin is ready to use."
echo ""
echo "Distribution package created: $OUTPUT_ZIP"
echo "File size: $(du -h "$OUTPUT_ZIP" | cut -f1)"
echo ""
echo "You can now:"
echo "  - Run: docker compose up"
echo "  - Or upload $OUTPUT_ZIP to another Moodle instance"

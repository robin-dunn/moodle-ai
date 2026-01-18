# ShowMyAI Plugin - Build Process

## Setup

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Initial Installation

```bash
cd plugins/showmyai
npm install
```

## Build Commands

### Build AMD Modules (One-time)
```bash
npm run build
```
This minifies all AMD modules from `amd/src/` to `amd/build/`.

### Watch Mode (Development)
```bash
npm run watch
```
Automatically rebuilds minified modules when source files change.
Press Ctrl+C to stop watching.

### Build Everything
```bash
npm run build:all
```

## File Structure
```
plugins/showmyai/
├── amd/
│   ├── src/
│   │   └── inject_button.js      (Source AMD module)
│   └── build/
│       └── inject_button.min.js  (Built/minified output)
├── lang/
├── lib.php
├── version.php
├── package.json
├── Gruntfile.js
└── BUILD.md
```

## Adding New AMD Modules

1. Create source file in `amd/src/module_name.js`
2. Update Gruntfile.js uglify.amd.files object:
   ```javascript
   files: {
       'amd/build/inject_button.min.js': 'amd/src/inject_button.js',
       'amd/build/module_name.min.js': 'amd/src/module_name.js'
   }
   ```
3. Run `npm run build` to minify

## Troubleshooting

### "grunt: command not found"
Run: `npm install` to ensure local Grunt is installed

### Changes not minifying
Ensure the source file is in `amd/src/` and run `npm run watch`

### Syntax errors during build
Check the JavaScript file for syntax errors and run build again

## Development Workflow

### Initial Setup
```bash
cd plugins/showmyai
npm install
npm run build
```

### Development (with watch)
```bash
npm run watch
# Modify amd/src/inject_button.js
# Watch automatically rebuilds amd/build/inject_button.min.js
```

### Before Committing
```bash
npm run build          # Ensure all modules are minified
# Test in Moodle to verify functionality
git add .
git commit -m "Update AMD modules"
```

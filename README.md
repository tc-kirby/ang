# Ang Anagram Finder

A fast anagram finder that uses Web Workers for performance.

## Running Locally

Due to browser security restrictions (CORS policy), you cannot open `index.html` directly by double-clicking it. The Web Worker requires the page to be served via HTTP.

### Option 1: Python HTTP Server (Recommended)

If you have Python installed:

```bash
# Python 3
python3 -m http.server 8080

# Python 2
python -m SimpleHTTPServer 8080
```

Then open your browser to: `http://localhost:8080`

### Option 2: Node.js HTTP Server

If you have Node.js installed:

```bash
npx http-server -p 8080
```

Then open your browser to: `http://localhost:8080`

### Option 3: PHP Server

If you have PHP installed:

```bash
php -S localhost:8080
```

Then open your browser to: `http://localhost:8080`

### Option 4: Use the included server script

We've included a simple server script for convenience:

```bash
./serve.sh
```

Then open your browser to: `http://localhost:8080`

## Features

- Fast anagram generation using a tree-based algorithm
- Web Worker for non-blocking computation
- Incremental rendering with `requestIdleCallback` to keep browser responsive
- Limit results by maximum number of words
- Displays up to 150,000 anagrams before stopping (to prevent browser crashes)

## How It Works

1. Enter text in the input field
2. Optionally select a maximum number of words
3. Click "Find anagrams!" or press Enter
4. Results will appear incrementally as they're found

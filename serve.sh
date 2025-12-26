#!/bin/bash
# Simple script to start a local HTTP server for testing

echo "Starting local HTTP server on port 8080..."
echo "Open your browser to: http://localhost:8080"
echo "Press Ctrl+C to stop the server"
echo ""

# Try different server options in order of preference
if command -v python3 &> /dev/null; then
    echo "Using Python 3..."
    python3 -m http.server 8080
elif command -v python &> /dev/null; then
    echo "Using Python 2..."
    python -m SimpleHTTPServer 8080
elif command -v php &> /dev/null; then
    echo "Using PHP..."
    php -S localhost:8080
else
    echo "Error: No suitable HTTP server found."
    echo "Please install Python, PHP, or Node.js to run the server."
    echo ""
    echo "Alternatively, you can use:"
    echo "  - Python 3: python3 -m http.server 8080"
    echo "  - Python 2: python -m SimpleHTTPServer 8080"
    echo "  - PHP: php -S localhost:8080"
    echo "  - Node.js: npx http-server -p 8080"
    exit 1
fi

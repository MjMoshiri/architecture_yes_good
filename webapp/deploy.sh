#!/bin/bash
set -e

echo "Building webapp..."
npm install
npm run build

echo "✅ Build complete!"
echo "Starting webapp with auto-restart..."

# Clean up old session files if they exist
echo "Cleaning up old terminal sessions..."
rm -f .terminal-sessions.json
rm -rf .terminal-sessions/

# Kill any existing ttyd processes (session manager will handle ttyd)
echo "Stopping any existing ttyd processes..."
pkill -f "ttyd" || true
sleep 2

# Kill any processes using terminal ports
for port in 7680 7681 7682 7683; do
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done
sleep 1

echo "Terminal sessions will be managed by the webapp session manager"

# Graceful shutdown handler
cleanup() {
    echo "Shutting down..."
    pkill -f "ttyd" || true
    pkill -f "next" || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Auto-restart webapp on crash
while true; do
    npm run start:prod
    echo "App crashed, restarting in 5 seconds..."
    sleep 5
done
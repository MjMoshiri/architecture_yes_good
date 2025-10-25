#!/bin/bash
set -e

echo "Building webapp..."
npm install
NODE_ENV=production npm run build

echo "✅ Build complete!"
echo "Starting ttyd and webapp with auto-restart..."

# Start ttyd in background
ttyd -i 0.0.0.0 -p 7683 -W -m 10 bash --login &
TTYD_PID=$!
echo "ttyd started on port 7683 (PID: $TTYD_PID)"

# Auto-restart webapp on crash
while true; do
    NODE_ENV=production npm run start:prod
    echo "App crashed, restarting in 5 seconds..."
    sleep 5
done
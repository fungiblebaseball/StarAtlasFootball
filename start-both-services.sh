#!/bin/bash

# Script to start both TypeScript server and Rust blockchain service
# Usage: bash start-both-services.sh

echo "Starting Galia Football with both services..."
echo "- TypeScript Server: http://localhost:5000"
echo "- Rust Blockchain Service: http://localhost:3001"
echo ""

# Use npx concurrently to run both services
npx concurrently \
  -n "TS,RUST" \
  -c "cyan,yellow" \
  "npm run dev" \
  "cd blockchain-service && RUST_LOG=info cargo run"

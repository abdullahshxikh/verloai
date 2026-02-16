#!/bin/sh
set -e

# Navigate to the repository root
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Install Node.js using Homebrew (skip if already installed)
if ! command -v node &> /dev/null; then
  brew install node
else
  echo "Node.js already installed: $(node --version)"
fi

# Install dependencies
npm install

# Install CocoaPods dependencies
cd ios
pod install

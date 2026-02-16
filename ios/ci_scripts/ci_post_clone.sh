#!/bin/sh
set -e

# Navigate to the repository root
cd "$CI_PRIMARY_REPOSITORY_PATH"

# Install Node.js using Homebrew (Xcode Cloud has Homebrew pre-installed)
brew install node

# Install dependencies
npm install

# Install CocoaPods dependencies
cd ios
pod install

#!/usr/bin/env bash
# Copyright (c) 2026, Antoine Duval
# Build the Python video analyzer for macOS using PyInstaller.
# Run from the python/ directory: sh build.sh

set -e

echo "Creating isolated virtual environment..."
python3 -m venv .venv
source .venv/bin/activate

echo "Installing dependencies..."
pip3 install -r requirements.txt

echo "Building macOS binary with PyInstaller..."
python3 -m PyInstaller --onefile --name darwin analyze_video.py

deactivate

echo "Moving binary to binaries/analyzer/darwin..."
mkdir -p ../binaries/analyzer
mv dist/darwin ../binaries/analyzer/darwin
chmod +x ../binaries/analyzer/darwin

echo "Cleaning up PyInstaller artifacts..."
rm -rf build dist darwin.spec

echo "Done! Binary at ../binaries/analyzer/darwin"

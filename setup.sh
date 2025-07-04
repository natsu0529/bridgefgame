#!/bin/bash

# Bridge Game Project Setup Script

echo "Setting up Bridge Game project..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Make scripts executable
chmod +x start_dev.sh

echo "Setup complete!"
echo "To start the development servers, run: ./start_dev.sh"
echo "To activate the virtual environment manually, run: source venv/bin/activate"

#!/bin/bash

# FastAPI Startup Script with Troubleshooting
# This script will help you start your FastAPI application correctly

echo "🚀 FastAPI Startup Script"
echo "========================="

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        echo "⚠️  Port $port is already in use"
        echo "   Processes using port $port:"
        lsof -i :$port
        echo ""
        read -p "Kill processes on port $port? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🔧 Killing processes on port $port..."
            lsof -ti :$port | xargs kill -9
            sleep 2
        else
            echo "❌ Cannot start server - port $port is occupied"
            return 1
        fi
    fi
    return 0
}

# Function to check and install dependencies
setup_environment() {
    echo "📦 Setting up Python environment..."
    
    # Check Python version
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python3 is not installed"
        echo "   Install with: sudo apt update && sudo apt install python3 python3-pip python3-venv"
        exit 1
    fi
    
    echo "✅ Python version: $(python3 --version)"
    
    # Create virtual environment if it doesn't exist
    if [ ! -d "venv" ]; then
        echo "🔨 Creating virtual environment..."
        python3 -m venv venv
    fi
    
    # Activate virtual environment
    echo "🔧 Activating virtual environment..."
    source venv/bin/activate
    
    # Upgrade pip
    echo "📦 Upgrading pip..."
    pip install --upgrade pip
    
    # Install minimal dependencies
    echo "📦 Installing FastAPI and Uvicorn..."
    pip install fastapi uvicorn[standard] python-multipart
    
    echo "✅ Environment setup complete"
}

# Function to test the minimal FastAPI app
test_minimal_app() {
    echo ""
    echo "🧪 Testing minimal FastAPI application..."
    
    # Start the minimal app in background
    echo "🚀 Starting minimal FastAPI server..."
    uvicorn main_minimal:app --host 0.0.0.0 --port 8000 --reload &
    SERVER_PID=$!
    
    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    sleep 5
    
    # Test the endpoints
    echo "🔍 Testing endpoints..."
    
    if curl -s http://localhost:8000/ > /dev/null; then
        echo "✅ Root endpoint: http://localhost:8000/ - Working"
        curl -s http://localhost:8000/ | jq '.' 2>/dev/null || curl -s http://localhost:8000/
    else
        echo "❌ Root endpoint failed"
    fi
    
    if curl -s http://localhost:8000/health > /dev/null; then
        echo "✅ Health endpoint: http://localhost:8000/health - Working"
    else
        echo "❌ Health endpoint failed"
    fi
    
    echo ""
    echo "🌐 Server is running at:"
    echo "   - Main: http://localhost:8000/"
    echo "   - Health: http://localhost:8000/health"
    echo "   - Test: http://localhost:8000/test"
    echo "   - Docs: http://localhost:8000/docs"
    echo ""
    
    # Keep server running
    echo "✅ Server is running successfully!"
    echo "   PID: $SERVER_PID"
    echo "   Press Ctrl+C to stop"
    
    # Wait for user to stop
    wait $SERVER_PID
}

# Function to start the full application
start_full_app() {
    echo ""
    echo "🚀 Starting full FastAPI application..."
    
    # Install full requirements
    if [ -f "requirements.txt" ]; then
        echo "📦 Installing full requirements..."
        pip install -r requirements.txt
    fi
    
    # Start the full app
    echo "🌐 Starting server on port 8001..."
    uvicorn main:app --host 0.0.0.0 --port 8001 --reload
}

# Main menu
main_menu() {
    echo ""
    echo "Choose an option:"
    echo "1) Test minimal FastAPI app (port 8000)"
    echo "2) Start full application (port 8001)"
    echo "3) Troubleshooting mode"
    echo "4) Exit"
    echo ""
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            check_port 8000 && test_minimal_app
            ;;
        2)
            check_port 8001 && start_full_app
            ;;
        3)
            troubleshooting_mode
            ;;
        4)
            echo "👋 Goodbye!"
            exit 0
            ;;
        *)
            echo "❌ Invalid option. Please choose 1-4."
            main_menu
            ;;
    esac
}

# Troubleshooting mode
troubleshooting_mode() {
    echo ""
    echo "🔧 Troubleshooting Mode"
    echo "======================"
    
    echo "1. Checking Python installation..."
    python3 --version
    
    echo ""
    echo "2. Checking virtual environment..."
    if [ -d "venv" ]; then
        echo "✅ Virtual environment exists"
        if [ "$VIRTUAL_ENV" ]; then
            echo "✅ Virtual environment is activated: $VIRTUAL_ENV"
        else
            echo "⚠️  Virtual environment not activated"
            echo "   Run: source venv/bin/activate"
        fi
    else
        echo "❌ Virtual environment not found"
        echo "   Run: python3 -m venv venv"
    fi
    
    echo ""
    echo "3. Checking FastAPI installation..."
    if python3 -c "import fastapi; print(f'FastAPI version: {fastapi.__version__}')" 2>/dev/null; then
        echo "✅ FastAPI is installed"
    else
        echo "❌ FastAPI not installed"
        echo "   Run: pip install fastapi"
    fi
    
    echo ""
    echo "4. Checking Uvicorn installation..."
    if python3 -c "import uvicorn; print(f'Uvicorn version: {uvicorn.__version__}')" 2>/dev/null; then
        echo "✅ Uvicorn is installed"
    else
        echo "❌ Uvicorn not installed"
        echo "   Run: pip install uvicorn[standard]"
    fi
    
    echo ""
    echo "5. Checking port availability..."
    for port in 8000 8001; do
        if lsof -i :$port >/dev/null 2>&1; then
            echo "⚠️  Port $port is in use:"
            lsof -i :$port
        else
            echo "✅ Port $port is available"
        fi
    done
    
    echo ""
    echo "6. Network troubleshooting..."
    echo "   Testing localhost connectivity..."
    if ping -c 1 127.0.0.1 >/dev/null 2>&1; then
        echo "✅ Localhost is reachable"
    else
        echo "❌ Localhost connection issue"
    fi
    
    echo ""
    echo "📋 Common Solutions:"
    echo "==================="
    echo "• ERR_CONNECTION_REFUSED:"
    echo "  - Server not started: Check if uvicorn is running"
    echo "  - Wrong port: Ensure you're using the correct port (8000/8001)"
    echo "  - Firewall: Check WSL/Ubuntu firewall settings"
    echo "  - Host binding: Use --host 0.0.0.0 instead of 127.0.0.1"
    echo ""
    echo "• Package errors:"
    echo "  - Activate virtual environment: source venv/bin/activate"
    echo "  - Install dependencies: pip install -r requirements.txt"
    echo "  - Update pip: pip install --upgrade pip"
    echo ""
    echo "• Port issues:"
    echo "  - Find process: lsof -i :8000"
    echo "  - Kill process: kill -9 <PID>"
    echo "  - Use different port: uvicorn main:app --port 8002"
    
    echo ""
    read -p "Press Enter to return to main menu..." 
    main_menu
}

# Start the script
cd "$(dirname "$0")"
setup_environment
main_menu

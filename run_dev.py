#!/usr/bin/env python3
"""
Script to run the React To-Do Kanban app in development mode.
This script starts the Vite development server.
"""

import os
import sys
import subprocess
import webbrowser
from pathlib import Path

# Configuration
PORT = 5173  # Default Vite port

def check_node_installed():
    """Check if Node.js is installed."""
    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"✓ Node.js found: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ Node.js is not installed. Please install Node.js first.")
        print("  Download from: https://nodejs.org/")
        return False

def check_npm_installed():
    """Check if npm is installed."""
    try:
        result = subprocess.run(
            ["npm", "--version"],
            capture_output=True,
            text=True,
            check=True
        )
        print(f"✓ npm found: {result.stdout.strip()}")
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ npm is not installed. Please install npm first.")
        return False

def install_dependencies():
    """Install npm dependencies if node_modules doesn't exist."""
    node_modules = Path(__file__).parent / "node_modules"
    
    if node_modules.exists():
        print("✓ Dependencies already installed")
        return True
    
    print("Installing dependencies...")
    try:
        subprocess.run(
            ["npm", "install"],
            check=True,
            cwd=Path(__file__).parent
        )
        print("✓ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("✗ Failed to install dependencies")
        return False

def run_dev_server():
    """Run the Vite development server."""
    print("\nStarting development server...")
    try:
        url = f"http://localhost:{PORT}"
        print(f"\n{'='*50}")
        print(f"✓ Development server starting...")
        print(f"  URL: {url}")
        print(f"  Press Ctrl+C to stop the server")
        print(f"{'='*50}\n")
        
        # Try to open browser automatically after a delay
        import threading
        import time
        
        def open_browser():
            time.sleep(2)  # Wait for server to start
            try:
                webbrowser.open(url)
            except:
                pass
        
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True
        browser_thread.start()
        
        # Start the dev server
        subprocess.run(
            ["npm", "run", "dev"],
            cwd=Path(__file__).parent
        )
    except KeyboardInterrupt:
        print("\n\n✓ Development server stopped")
        return True
    except subprocess.CalledProcessError:
        print("✗ Failed to start development server")
        return False

def main():
    """Main function to run the dev server."""
    print("="*50)
    print("React To-Do Kanban App - Development Server")
    print("="*50)
    
    # Check prerequisites
    if not check_node_installed():
        sys.exit(1)
    
    if not check_npm_installed():
        sys.exit(1)
    
    # Install dependencies if needed
    if not install_dependencies():
        sys.exit(1)
    
    # Run dev server
    run_dev_server()

if __name__ == "__main__":
    main()


#!/usr/bin/env python3
"""
Script to build and serve the React To-Do Kanban app.
This script builds the production version and serves it locally.
"""

import os
import sys
import subprocess
import http.server
import socketserver
import webbrowser
from pathlib import Path

# Configuration
PORT = 3000
BUILD_DIR = Path(__file__).parent / "dist"
NODE_MODULES = Path(__file__).parent / "node_modules"

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
    if NODE_MODULES.exists():
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

def build_app():
    """Build the React app for production."""
    print("\nBuilding the app for production...")
    try:
        subprocess.run(
            ["npm", "run", "build"],
            check=True,
            cwd=Path(__file__).parent
        )
        print("✓ Build completed successfully")
        return True
    except subprocess.CalledProcessError:
        print("✗ Build failed")
        return False

def serve_app(port=PORT):
    """Serve the built app using Python's HTTP server."""
    if not BUILD_DIR.exists():
        print(f"✗ Build directory not found: {BUILD_DIR}")
        print("  Please run the build first")
        return False
    
    os.chdir(BUILD_DIR)
    
    handler = http.server.SimpleHTTPRequestHandler
    
    # Add CORS headers for development
    class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            super().end_headers()
    
    try:
        with socketserver.TCPServer(("", port), CORSRequestHandler) as httpd:
            url = f"http://localhost:{port}"
            print(f"\n{'='*50}")
            print(f"✓ Server started successfully!")
            print(f"  Serving at: {url}")
            print(f"  Build directory: {BUILD_DIR}")
            print(f"\n  Press Ctrl+C to stop the server")
            print(f"{'='*50}\n")
            
            # Try to open browser automatically
            try:
                webbrowser.open(url)
            except:
                pass
            
            httpd.serve_forever()
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"✗ Port {port} is already in use")
            print(f"  Try using a different port or stop the process using port {port}")
        else:
            print(f"✗ Failed to start server: {e}")
        return False
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped")
        return True

def main():
    """Main function to build and serve the app."""
    print("="*50)
    print("React To-Do Kanban App - Build & Serve Script")
    print("="*50)
    
    # Check prerequisites
    if not check_node_installed():
        sys.exit(1)
    
    if not check_npm_installed():
        sys.exit(1)
    
    # Install dependencies if needed
    if not install_dependencies():
        sys.exit(1)
    
    # Build the app
    if not build_app():
        sys.exit(1)
    
    # Serve the app
    serve_app()

if __name__ == "__main__":
    main()


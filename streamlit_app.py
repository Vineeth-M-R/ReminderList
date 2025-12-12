"""
Streamlit wrapper to serve the React To-Do Kanban app.

Note: This is a workaround since Streamlit is designed for Python apps.
For best results, deploy the React app directly to Vercel/Netlify.
"""

import streamlit as st
import subprocess
import os
from pathlib import Path
import time

# Page config
st.set_page_config(
    page_title="To-Do Kanban App",
    page_icon="📋",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Hide Streamlit branding
hide_streamlit_style = """
<style>
#MainMenu {visibility: hidden;}
footer {visibility: hidden;}
header {visibility: hidden;}
</style>
"""
st.markdown(hide_streamlit_style, unsafe_allow_html=True)

# Check if app is built
BUILD_DIR = Path(__file__).parent / "dist"
NODE_MODULES = Path(__file__).parent / "node_modules"

def check_and_build():
    """Check if app needs to be built and build it."""
    if not BUILD_DIR.exists() or not any(BUILD_DIR.iterdir()):
        st.warning("⚠️ App not built yet. Building now...")
        
        # Check if node_modules exists
        if not NODE_MODULES.exists():
            with st.spinner("Installing dependencies..."):
                result = subprocess.run(
                    ["npm", "install"],
                    cwd=Path(__file__).parent,
                    capture_output=True,
                    text=True
                )
                if result.returncode != 0:
                    st.error("Failed to install dependencies")
                    st.code(result.stderr)
                    return False
        
        # Build the app
        with st.spinner("Building the app (this may take a minute)..."):
            result = subprocess.run(
                ["npm", "run", "build"],
                cwd=Path(__file__).parent,
                capture_output=True,
                text=True
            )
            if result.returncode != 0:
                st.error("Build failed")
                st.code(result.stderr)
                return False
        
        st.success("✓ Build completed!")
        st.rerun()
    
    return True

def main():
    """Main Streamlit app."""
    st.title("📋 To-Do Kanban App")
    
    # Check prerequisites
    try:
        subprocess.run(["node", "--version"], capture_output=True, check=True)
        subprocess.run(["npm", "--version"], capture_output=True, check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        st.error("""
        **Node.js and npm are required!**
        
        Please install Node.js from https://nodejs.org/
        
        Then run this command in your terminal to build the app:
        ```bash
        python3 start_app.py
        ```
        
        Or use the development server:
        ```bash
        python3 run_dev.py
        ```
        """)
        return
    
    # Check and build if needed
    if not check_and_build():
        return
    
    # Instructions
    with st.expander("ℹ️ How to use"):
        st.markdown("""
        **This Streamlit wrapper embeds the React app.**
        
        For best experience:
        1. Run `python3 start_app.py` in a terminal to start the production server
        2. Or run `python3 run_dev.py` for development mode
        3. Access the app directly at the URL shown in the terminal
        
        **Recommended:** Deploy to Vercel/Netlify for production use.
        See `DEPLOYMENT.md` for instructions.
        """)
    
    # Embed the app using iframe
    # Note: This requires the app to be running on localhost:3000 or similar
    st.markdown("---")
    st.subheader("App Preview")
    
    # Check if server is running
    import socket
    def is_port_open(host, port):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except:
            return False
    
    port = st.selectbox("Select port", [3000, 5173], index=0)
    
    if is_port_open("localhost", port):
        st.success(f"✓ Server detected on port {port}")
        app_url = f"http://localhost:{port}"
        
        # Embed using iframe
        st.components.v1.iframe(
            src=app_url,
            width=None,
            height=800,
            scrolling=True
        )
    else:
        st.warning(f"""
        **Server not running on port {port}**
        
        Please start the server first:
        
        **Option 1 - Production:**
        ```bash
        python3 start_app.py
        ```
        
        **Option 2 - Development:**
        ```bash
        python3 run_dev.py
        ```
        
        Then refresh this page.
        """)
        
        if st.button("🔄 Refresh"):
            st.rerun()

if __name__ == "__main__":
    main()


# Python Scripts for Running the App

This project includes Python scripts to easily start the React To-Do Kanban app.

## Scripts Available

### 1. `run_dev.py` - Development Mode
Runs the app in development mode with hot-reloading.

```bash
python3 run_dev.py
```

**Features:**
- Starts Vite development server
- Hot module replacement (HMR)
- Auto-opens browser
- Runs on `http://localhost:5173`

### 2. `start_app.py` - Production Build & Serve
Builds the app for production and serves it locally.

```bash
python3 start_app.py
```

**Features:**
- Builds the production version
- Serves the built app
- Runs on `http://localhost:3000`
- Optimized for production

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Python 3** (usually pre-installed on macOS/Linux)

## Usage

### Development Mode (Recommended for development)
```bash
python3 run_dev.py
```

### Production Mode (For testing production build)
```bash
python3 start_app.py
```

## What the Scripts Do

1. **Check Prerequisites**: Verify Node.js and npm are installed
2. **Install Dependencies**: Automatically run `npm install` if needed
3. **Build/Serve**: 
   - `run_dev.py`: Starts dev server
   - `start_app.py`: Builds then serves production version

## For Streamlit Hosting

**Note**: Streamlit is designed for Python web apps, not React apps. However, you have a few options:

### Option 1: Use Streamlit to Serve Static Files
You can create a simple Streamlit app that serves the built React app:

```python
# streamlit_app.py
import streamlit as st
import os
from pathlib import Path

# Build the React app first using start_app.py
# Then serve the dist folder

st.title("To-Do Kanban App")

# Serve static files from dist directory
dist_path = Path(__file__).parent / "dist"
if dist_path.exists():
    st.markdown("""
    <iframe src="http://localhost:3000" width="100%" height="800" frameborder="0"></iframe>
    """, unsafe_allow_html=True)
else:
    st.error("Please run start_app.py first to build the app")
```

### Option 2: Deploy to Vercel/Netlify (Recommended)
For React apps, it's better to use platforms designed for them:
- **Vercel**: Best for React/Next.js apps
- **Netlify**: Great for static sites
- **GitHub Pages**: Free hosting

See `DEPLOYMENT.md` for detailed instructions.

### Option 3: Use Python HTTP Server
The `start_app.py` script already serves the built app using Python's built-in HTTP server, which you can use directly.

## Troubleshooting

### Port Already in Use
If you get "Address already in use" error:
- Change the port in the script
- Or stop the process using that port:
  ```bash
  # Find process using port 3000
  lsof -ti:3000 | xargs kill
  ```

### Dependencies Not Installing
- Make sure you have Node.js installed
- Try running `npm install` manually
- Check your internet connection

### Build Fails
- Make sure all dependencies are installed
- Check for errors in the terminal
- Verify your `.env` file has Supabase credentials

## Environment Variables

Make sure you have a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```


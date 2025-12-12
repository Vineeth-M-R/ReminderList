# To-Do List App

A beautiful notebook-style to-do list application built with React, Vite, and Supabase.

## Features

- ✨ Notebook-style UI design
- ✅ Add and manage tasks
- 🎯 Mark tasks as complete with visual strike-through
- 💾 Persistent storage with Supabase (PostgreSQL)
- 🔄 Real-time updates
- 📱 Responsive design

## Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (free tier works)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Follow the instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
   - Create your Supabase project and database table
   - Get your API keys

3. **Configure environment variables:**
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_project_url
     VITE_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:5173` (or the port shown in your terminal)

## Project Structure

```
to-do/
├── src/
│   ├── lib/
│   │   └── supabase.js      # Supabase client configuration
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   └── main.jsx             # Entry point
├── SUPABASE_SETUP.md        # Detailed Supabase setup guide
└── README.md                # This file
```

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **Supabase** - Backend database (PostgreSQL)
- **CSS** - Custom styling for notebook aesthetic

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Notes

- The app uses Supabase for data persistence (no localStorage)
- Real-time updates are enabled via Supabase subscriptions
- The database schema is defined in `SUPABASE_SETUP.md`

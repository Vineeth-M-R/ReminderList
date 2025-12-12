# Supabase Setup Guide

This app uses Supabase as the backend database. Follow these steps to set it up:

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details (name, database password, region)
4. Wait for the project to be created

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**
3. You'll need these for the `.env` file

## 3. Create the Database Table

In your Supabase project dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. Run the following SQL:

```sql
-- Create todos table
CREATE TABLE todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  status TEXT DEFAULT 'todo' NOT NULL CHECK (status IN ('todo', 'in_progress', 'done')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read todos
CREATE POLICY "Allow public read access" ON todos
  FOR SELECT USING (true);

-- Create a policy that allows anyone to insert todos
CREATE POLICY "Allow public insert access" ON todos
  FOR INSERT WITH CHECK (true);

-- Create a policy that allows anyone to update todos
CREATE POLICY "Allow public update access" ON todos
  FOR UPDATE USING (true);

-- Create a policy that allows anyone to delete todos (optional, for future use)
CREATE POLICY "Allow public delete access" ON todos
  FOR DELETE USING (true);

-- Create an index on created_at for better query performance
CREATE INDEX idx_todos_created_at ON todos(created_at);

-- Create an index on status for better query performance
CREATE INDEX idx_todos_status ON todos(status);
```

**Note:** If you already have a `todos` table with a `done` boolean field, you can migrate it by running:

```sql
-- Add status column
ALTER TABLE todos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'todo';

-- Migrate existing data: set status based on done field
UPDATE todos SET status = CASE 
  WHEN done = true THEN 'done'
  ELSE 'todo'
END;

-- Make status NOT NULL after migration
ALTER TABLE todos ALTER COLUMN status SET NOT NULL;

-- Add check constraint
ALTER TABLE todos ADD CONSTRAINT todos_status_check CHECK (status IN ('todo', 'in_progress', 'done'));

-- Optionally remove the old done column (backup first!)
-- ALTER TABLE todos DROP COLUMN done;
```

## 4. Set Up Environment Variables

1. Create a `.env` file in the root of your project (copy from `.env.example` if it exists)
2. Add your Supabase credentials:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from step 2.

## 5. Start the App

```bash
npm install
npm run dev
```

## Security Note

The current setup uses public access policies for simplicity. For production, you should:
- Implement authentication (Supabase Auth)
- Use user-specific policies
- Restrict access based on user IDs

## Troubleshooting

- **"Missing Supabase environment variables"**: Make sure your `.env` file exists and contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **"Failed to fetch todos"**: Check that your Supabase project is active and the table was created correctly
- **CORS errors**: Ensure your Supabase project allows requests from your localhost (should work by default)


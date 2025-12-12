# Deployment Guide

This guide will help you deploy your to-do app to production. We recommend **Vercel** for the easiest deployment experience.

## Option 1: Vercel (Recommended) 🚀

Vercel is the easiest option for Vite React apps with automatic deployments from Git.

### Prerequisites
- A GitHub, GitLab, or Bitbucket account
- Your code pushed to a Git repository

### Step-by-Step Deployment

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin your-repository-url
   git push -u origin main
   ```

2. **Sign up for Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account (recommended)

3. **Import your project:**
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a Vite project

4. **Configure environment variables:**
   - In the project settings, go to **Settings** → **Environment Variables**
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Make sure to add them for **Production**, **Preview**, and **Development** environments

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)
   - Your app will be live at `your-project-name.vercel.app`

6. **Custom Domain (Optional):**
   - Go to **Settings** → **Domains**
   - Add your custom domain
   - Follow the DNS configuration instructions

### Automatic Deployments
- Every push to `main` branch = Production deployment
- Every push to other branches = Preview deployment
- Pull requests = Preview deployment with comments

---

## Option 2: Netlify 🌐

Netlify is another great option with similar features to Vercel.

### Step-by-Step Deployment

1. **Push your code to GitHub** (same as Vercel step 1)

2. **Sign up for Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with your GitHub account

3. **Create a new site:**
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository

4. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - Netlify should auto-detect these for Vite projects

5. **Add environment variables:**
   - Go to **Site settings** → **Environment variables**
   - Add:
     - `VITE_SUPABASE_URL` = your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

6. **Deploy:**
   - Click "Deploy site"
   - Your app will be live at `your-project-name.netlify.app`

---

## Option 3: GitHub Pages 📄

Free hosting directly from GitHub, but requires a bit more setup.

### Step-by-Step Deployment

1. **Install gh-pages package:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   Add these scripts:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Update vite.config.js:**
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/', // Replace with your actual repo name
   })
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages:**
   - Go to your repo → **Settings** → **Pages**
   - Select source: `gh-pages` branch
   - Your app will be at `username.github.io/repo-name`

**Note:** GitHub Pages doesn't support environment variables directly. You'll need to use a different approach or consider Vercel/Netlify.

---

## Important Notes for All Platforms

### Environment Variables
Make sure to add your Supabase credentials as environment variables in your hosting platform. Never commit `.env` files to Git!

### Supabase CORS Configuration
1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Under "Allowed Origins", add your production URL:
   - For Vercel: `https://your-project.vercel.app`
   - For Netlify: `https://your-project.netlify.app`
   - For GitHub Pages: `https://username.github.io`

### Testing Your Deployment

After deployment, test:
- ✅ Can you add todos?
- ✅ Can you toggle todos?
- ✅ Can you delete todos?
- ✅ Do changes persist after refresh?

### Troubleshooting

**Build fails:**
- Check that all dependencies are in `package.json`
- Ensure build command is correct
- Check build logs for specific errors

**Environment variables not working:**
- Make sure variable names start with `VITE_`
- Redeploy after adding environment variables
- Check that variables are added to the correct environment (Production/Preview)

**CORS errors:**
- Add your production URL to Supabase allowed origins
- Check browser console for specific error messages

**Database connection issues:**
- Verify Supabase project is active
- Check that RLS policies allow public access (for this demo app)
- Verify environment variables are set correctly

---

## Recommended: Vercel

For this project, we recommend **Vercel** because:
- ✅ Zero configuration needed
- ✅ Automatic deployments from Git
- ✅ Free SSL certificates
- ✅ Custom domains
- ✅ Preview deployments for PRs
- ✅ Great performance with global CDN
- ✅ Easy environment variable management

---

## Quick Start with Vercel CLI (Alternative)

If you prefer command-line deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? (press enter for default)
# - Directory? (press enter for current)
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy to production
vercel --prod
```

Your app will be live at the URL provided!


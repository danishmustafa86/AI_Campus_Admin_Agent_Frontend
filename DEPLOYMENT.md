# Deploying Frontend to Vercel

This guide will help you deploy your React + Vite frontend to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier available)
2. Your backend API deployed and accessible via HTTPS
3. Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Repository

Your code is already prepared with:
- ✅ `vercel.json` configuration file
- ✅ Environment variable setup in `api.ts`
- ✅ `.gitignore` updated for environment files

## Step 2: Create Environment Files (Local Development)

Create a `.env.local` file in the `frontend` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

**Note:** `.env.local` is already in `.gitignore` and won't be committed.

## Step 3: Push to Git Repository

1. Initialize git repository (if not already done):
```bash
cd frontend
git init
git add .
git commit -m "Initial commit - ready for Vercel deployment"
```

2. Create a new repository on GitHub/GitLab/Bitbucket

3. Push your code:
```bash
git remote add origin <your-repository-url>
git branch -M main
git push -u origin main
```

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` (if deploying only frontend)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   
5. Add Environment Variables:
   - Click **"Environment Variables"**
   - Add: `VITE_API_BASE_URL` = `<your-backend-api-url>`
   - Example: `https://your-backend.onrender.com` or `https://api.yourdomain.com`

6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from the frontend directory:
```bash
cd frontend
vercel
```

4. Follow the prompts:
   - Link to existing project or create new
   - Set root directory if needed
   
5. Add environment variables:
```bash
vercel env add VITE_API_BASE_URL
```
Enter your backend API URL when prompted.

6. Deploy to production:
```bash
vercel --prod
```

## Step 5: Configure Environment Variables

After initial deployment, you can manage environment variables:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update variables:
   - `VITE_API_BASE_URL`: Your backend API URL (must be HTTPS)

## Step 6: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Navigate to **Settings** → **Domains**
3. Add your custom domain and follow DNS setup instructions

## Important Notes

### Backend API Requirements

Your backend API must:
- ✅ Be accessible via HTTPS (not HTTP)
- ✅ Have CORS configured to allow requests from your Vercel domain
- ✅ Be deployed on a platform like:
  - Render
  - Railway
  - Heroku
  - AWS/GCP/Azure
  - DigitalOcean

### CORS Configuration

Update your backend's CORS settings to include your Vercel domain:

```python
# In your FastAPI backend (backend/main.py)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",  # Local development
        "https://your-app.vercel.app",  # Your Vercel domain
        "https://your-custom-domain.com",  # Custom domain if any
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Automatic Deployments

Once connected, Vercel will automatically:
- Deploy on every push to `main` branch (production)
- Create preview deployments for pull requests
- Provide unique URLs for each deployment

## Testing Your Deployment

1. Visit your Vercel deployment URL
2. Test login/signup functionality
3. Test chat functionality
4. Check browser console for any CORS or API errors
5. Verify all routes work correctly (thanks to SPA routing in `vercel.json`)

## Troubleshooting

### Issue: API calls failing with CORS errors
**Solution:** Ensure your backend CORS configuration includes your Vercel domain

### Issue: 404 on page refresh
**Solution:** Already handled by `vercel.json` rewrite rules

### Issue: Environment variables not working
**Solution:** 
- Ensure variables start with `VITE_` prefix
- Redeploy after adding environment variables
- Check Vercel deployment logs

### Issue: Build failures
**Solution:**
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Test build locally: `npm run build`

## Useful Vercel Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs <deployment-url>

# List all deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>
```

## Monitoring and Analytics

Vercel provides:
- Real-time deployment logs
- Performance analytics
- Error tracking
- Bandwidth usage

Access these in your Vercel Dashboard under your project.

## Cost

- **Free Tier:** Perfect for personal projects
  - 100 GB bandwidth
  - Unlimited deployments
  - Custom domains
  - Automatic HTTPS

For more details, visit [Vercel Pricing](https://vercel.com/pricing)

---

## Quick Deployment Checklist

- [ ] Backend deployed and accessible via HTTPS
- [ ] CORS configured on backend
- [ ] Code pushed to Git repository
- [ ] Vercel account created
- [ ] Project imported to Vercel
- [ ] `VITE_API_BASE_URL` environment variable set in Vercel
- [ ] Deployment successful
- [ ] Login/signup functionality tested
- [ ] Chat functionality tested
- [ ] All routes accessible

---

**Need Help?** Check [Vercel Documentation](https://vercel.com/docs) or [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)


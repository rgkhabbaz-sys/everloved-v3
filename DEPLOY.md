# Deploying EverLoved to Vercel

This guide outlines the steps to deploy the EverLoved application to Vercel.

## Prerequisites

- A [GitHub](https://github.com) account.
- A [Vercel](https://vercel.com) account.
- [Node.js](https://nodejs.org/) installed locally.

## Steps

### 1. Push to GitHub

If you haven't already, push your code to a GitHub repository.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Import to Vercel

1.  Log in to your Vercel dashboard.
2.  Click **"Add New..."** -> **"Project"**.
3.  Select your GitHub repository (`everloved-app` or similar).
4.  Vercel will automatically detect that it's a Next.js project.

### 3. Configure Project

- **Framework Preset**: Next.js (default)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 4. Deploy

Click **"Deploy"**. Vercel will build your application and assign it a production URL.

## Verification

Once deployed, visit the provided URL to verify:
- The landing page loads with the background animation.
- Navigation tabs work correctly.
- The "Patient Comfort" voice session interacts as expected.

# Fix Admin Panel on Published Site - Netlify Configuration

## Problem
The admin panel works locally but shows "Database Not Connected" on the published site.

## Root Cause
The environment variables in Netlify are either not set or using old credentials.

## Solution: Update Environment Variables in Netlify

### Step 1: Access Netlify Dashboard

1. Go to https://app.netlify.com
2. Log in to your account
3. Select your **Financial Folks** site

### Step 2: Update Environment Variables

1. Click **Site configuration** in the left sidebar
2. Click **Environment variables** (or go to Site settings → Environment variables)
3. Add or update these FOUR variables:

| Variable Name | Value |
|---------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://ovfrkfddnifxnckrfcyj.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZnJrZmRkbmlmeG5ja3JmY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjA5NDUsImV4cCI6MjA3ODg5Njk0NX0.KmOks97jywnXblX9tKHlWdllIx5vSNOoV8y9kcJue3Y` |
| `RESEND_API_KEY` | `re_SR1Pg6vg_MCMTqhA1orqwhUJCxDYEARD9` |
| `ADMIN_EMAIL` | `financialfolksblog@gmail.com` |

**Important:**
- Make sure to set these for **all scopes** (Production, Deploy Previews, Branch deploys)
- The variable names are CASE SENSITIVE - copy them exactly as shown
- Add all FOUR variables (including ADMIN_EMAIL)

### Step 3: Redeploy Your Site

After adding the environment variables:

1. Go to **Deploys** in the Netlify dashboard
2. Click **Trigger deploy** button (top right)
3. Select **Deploy site**
4. Wait for the deployment to complete (usually 2-3 minutes)

### Step 4: Verify It Works

1. Visit your published site
2. Add `#admin` to the URL (e.g., `https://yoursite.netlify.app#admin`)
3. You should now see the admin login screen
4. After logging in, the admin panel should connect successfully

## Alternative: Quick Deploy from Git

If you're using Git:

1. The `netlify.toml` and `.env` files have been updated with the correct credentials
2. Simply **commit and push** the changes
3. Netlify will automatically redeploy with the new settings

```bash
git add netlify.toml .env
git commit -m "Update Supabase credentials for production"
git push
```

## What Changed

### Files Updated:
1. ✅ `.env` - Updated with correct Supabase credentials + admin email
2. ✅ `netlify.toml` - Added production environment variables

### Environment Variables Now Include:
- `NEXT_PUBLIC_SUPABASE_URL` - Database connection URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public API key for client-side
- `RESEND_API_KEY` - For sending emails via edge functions
- `ADMIN_EMAIL` - Email address for notifications (financialfolksblog@gmail.com)

### Why This Fixes It:
- Next.js apps need environment variables that start with `NEXT_PUBLIC_` to be available in the browser
- Netlify uses the `[context.production.environment]` section in `netlify.toml` OR the dashboard settings
- The old credentials were commented out, so the site couldn't connect

## Troubleshooting

### Still Not Working?

1. **Clear Cache and Redeploy**
   - In Netlify: Deploys → Trigger deploy → Clear cache and deploy site

2. **Check Browser Console**
   - Open browser DevTools (F12)
   - Look for any error messages
   - Check if the Supabase URL is correct in the Network tab

3. **Verify Environment Variables**
   - In Netlify dashboard, check that all 4 variables are set
   - Make sure there are no extra spaces in the values
   - Verify the values match exactly (they are case-sensitive)

4. **Wait for DNS Propagation**
   - Sometimes it takes 5-10 minutes for changes to appear
   - Try in an incognito/private window

## Security Note

The environment variables in `netlify.toml` are safe to commit because:
- `NEXT_PUBLIC_*` variables are meant to be public (they're exposed in the browser anyway)
- The Supabase anon key is designed to be public
- Row Level Security (RLS) in Supabase protects your data
- The RESEND_API_KEY and ADMIN_EMAIL are for server-side functions only

However, if you prefer, you can keep them only in the Netlify dashboard and remove them from `netlify.toml`.

## Summary
After completing these steps, your admin panel will:
- ✅ Connect to the Supabase database
- ✅ Allow creating and managing blog posts
- ✅ Show contact form questions
- ✅ Manage resources and gallery photos
- ✅ Send email notifications to financialfolksblog@gmail.com

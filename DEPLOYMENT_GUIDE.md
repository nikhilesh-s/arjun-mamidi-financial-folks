# Deployment Guide for Arjun

This guide walks you through setting up your Financial Folks website with Supabase. Follow these steps carefully.

## Prerequisites

You already have:
- ✅ Supabase project created at https://ovfrkfddnifxnckrfcyj.supabase.co
- ✅ Bolt.new hosting configured
- ✅ Resend email API configured

## Step 1: Run the Database Migration

**This is the most important step! Do this first.**

1. Go to https://supabase.com/dashboard
2. Select your project (ovfrkfddnifxnckrfcyj)
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"** button
5. Open the file `supabase/migrations/00_complete_schema.sql` from your project
6. Copy **ALL** the SQL code (select all and copy)
7. Paste it into the SQL Editor
8. Click **"Run"** button at the bottom right
9. You should see: **"Success. No rows returned"**

**What this does:** Creates all 7 database tables with proper security policies, indexes, and everything needed for your website to work.

If you see any errors, copy the error message and contact your developer.

## Step 2: Deploy Edge Functions

Edge functions handle email sending. You need to deploy 4 functions:

### How to Deploy Each Function

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **"Edge Functions"** in the left sidebar
4. Click **"Deploy new function"**

### Function 1: send-contact-question

- **Name:** `send-contact-question`
- **Code:** Copy from `supabase/functions/send-contact-question/index.ts`
- **Purpose:** Sends you an email when someone asks a question
- Click **"Deploy"**

### Function 2: send-newsletter-email

- **Name:** `send-newsletter-email`
- **Code:** Copy from `supabase/functions/send-newsletter-email/index.ts`
- **Purpose:** Sends blog post notifications to subscribers
- Click **"Deploy"**

### Function 3: send-newsletter-confirmation

- **Name:** `send-newsletter-confirmation`
- **Code:** Copy from `supabase/functions/send-newsletter-confirmation/index.ts`
- **Purpose:** Sends welcome email to new subscribers
- Click **"Deploy"**

### Function 4: send-application-notification

- **Name:** `send-application-notification`
- **Code:** Copy from `supabase/functions/send-application-notification/index.ts`
- **Purpose:** Sends confirmation for community applications
- Click **"Deploy"**

**Important:** Make sure the function names exactly match what's written above!

## Step 3: Set Environment Variables in Supabase Edge Functions

Your edge functions need the Resend API key to send emails:

1. In Supabase dashboard, go to **"Edge Functions"**
2. Click **"Manage secrets"** or **"Environment variables"**
3. Add these variables:
   - `RESEND_API_KEY` = `re_SR1Pg6vg_MCMTqhA1orqwhUJCxDYEARD9`
   - `ADMIN_EMAIL` = `financialfolksblog@gmail.com`

## Step 4: Verify Everything Works

### Test 1: Access Your Website
1. Go to your Bolt.new website URL
2. The homepage should load without errors
3. Click through all the pages (Home, About, Blog, etc.)

### Test 2: Access Admin Panel
1. Click **"Admin"** in the navigation
2. Enter password: `mangorocks!`
3. You should see the admin dashboard with 4 tabs:
   - Blog Posts
   - Questions
   - Resources
   - Gallery

### Test 3: Create a Test Blog Post
1. In admin panel, go to **"Blog Posts"** tab
2. Click **"Create New Post"**
3. Fill in the form:
   - Title: "Test Post"
   - Excerpt: "This is a test"
   - Content: "Hello world"
4. Click **"Save as Draft"**
5. You should see "Blog post created successfully!"
6. The post should appear in the list below
7. Click **"Delete"** to remove the test post

### Test 4: Check Questions Page
1. Go to your website
2. Click **"Ask a Question"** in navigation
3. Try submitting a test question
4. Go back to admin panel
5. Check **"Questions"** tab - your test question should be there

## Step 5: Create Your First Real Blog Post

Now you're ready to create real content!

1. Go to admin panel → **"Blog Posts"** tab
2. Click **"Create New Post"**
3. Fill in all fields carefully:
   - **Title**: Write an engaging title (e.g., "Why Saving Money Matters")
   - **Excerpt**: Write 2-3 sentences summarizing the post
   - **Featured Image URL**: Upload image to https://imgur.com, copy direct link
   - **Content**: Write your full blog post
   - **Author**: Arjun Mamidi (or your preferred name)
4. Click **"Save as Draft"** to save without publishing
5. Review the post on the Blog page
6. When ready, click **"Publish & Send"** to:
   - Make it visible on your website
   - Send email notifications to all subscribers

## Step 6: Add Resources

1. Go to admin panel → **"Resources"** tab
2. Click **"Add Resource"**
3. Add educational resources like:
   - Worksheets
   - Activity guides
   - External learning resources
4. Each resource needs:
   - Title
   - Description
   - Link (Google Doc or external URL)

## Step 7: Add Gallery Photos

1. Go to admin panel → **"Gallery"** tab
2. Click **"Add Photo"**
3. Upload images to https://imgur.com
4. Copy the direct image link (must end in .jpg, .png, etc.)
5. Paste URL and add optional caption
6. Click **"Add Photo"**
7. Photos will appear on the Explore page

## Common Issues & Solutions

### "Database Not Connected" error in admin panel
**Solution:** You didn't run the SQL migration. Go back to Step 1.

### "Question submissions are not available"
**Solution:** Check that:
1. SQL migration was run successfully
2. Environment variables are set in Bolt
3. Edge function `send-contact-question` is deployed

### Newsletter emails not sending
**Solution:** Check that:
1. All 4 edge functions are deployed
2. RESEND_API_KEY is set in Supabase edge function environment
3. Your Resend account is active

### Images not displaying
**Solution:**
1. Make sure you're using direct Imgur links (e.g., https://i.imgur.com/abc123.png)
2. Test the image URL in a browser first
3. Avoid album links or preview page links

### Can't log into admin panel
**Solution:** Password is: `mangorocks!` (all lowercase, no spaces)

## Getting Help

If something isn't working:

1. **Check browser console:** Right-click → Inspect → Console tab (look for red errors)
2. **Check Supabase logs:** Supabase dashboard → Logs
3. **Verify migration:** Supabase dashboard → Table Editor (should see 7 tables)
4. **Contact developer:** Provide screenshots of any errors

## Admin Password

Your admin panel password is: **mangorocks!**

To change it later, edit this file:
- `components/pages/admin-page.tsx`
- Line 96: `const ADMIN_PASSWORD = 'mangorocks!';`

## Summary Checklist

Before considering setup complete, verify:

- [ ] SQL migration ran successfully (7 tables created)
- [ ] All 4 edge functions deployed to Supabase
- [ ] Environment variables set in Supabase edge functions
- [ ] Can access admin panel with password
- [ ] Can create and delete test blog posts
- [ ] Can submit test questions
- [ ] Can add/delete test resources
- [ ] Can add/delete test gallery photos
- [ ] Blog page shows posts correctly
- [ ] All navigation links work

Once all items are checked, your website is fully operational!

## Next Steps

After setup is complete:
1. Start creating real blog posts about financial literacy
2. Add educational resources and worksheets
3. Upload photos from community events
4. Respond to questions from visitors
5. Build your subscriber list
6. Publish regular content to engage your audience

Good luck with Financial Folks! 🎉

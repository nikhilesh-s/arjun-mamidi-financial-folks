# Financial Folks - Financial Literacy Education Platform

A modern financial literacy education platform built with Next.js, Supabase, and TypeScript. Designed to teach kids about money through engaging blog posts, activities, and resources.

## Features

- **Blog System**: Weekly blog posts about financial literacy for kids
- **Admin Dashboard**: Complete admin interface for content management
- **Questions System**: Allow visitors to ask questions about financial education
- **Resources Library**: Curated educational resources and activities
- **Gallery**: Photo gallery for community events and activities
- **Newsletter**: Email subscription for blog updates
- **Responsive Design**: Beautiful, mobile-first design that works on all devices

## Tech Stack

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Edge Functions**: Supabase Edge Functions (for email notifications)
- **Email**: Resend API
- **Hosting**: Bolt.new
- **Icons**: Tabler Icons

## Quick Start for Arjun

### 1. Database Setup

**IMPORTANT: You need to run the SQL migration first!**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New query"
5. Open the file `supabase/migrations/00_complete_schema.sql` in this project
6. Copy ALL the SQL code from that file
7. Paste it into the SQL Editor
8. Click "Run" to execute the migration
9. You should see "Success. No rows returned" - this means all tables were created!

This will create all 7 database tables with proper security policies:
- `blog_posts` - Blog articles
- `comments` - Blog comments
- `community_members` - Member applications
- `newsletter_subscribers` - Email subscribers
- `contact_questions` - Questions from visitors
- `resources` - Educational resources
- `gallery_photos` - Photo gallery

### 2. Edge Functions Deployment

You have 4 edge functions that need to be deployed to Supabase for email functionality:

1. Go to your Supabase dashboard
2. Click on "Edge Functions" in the left sidebar
3. For each function folder in `supabase/functions/`:
   - Click "Deploy new function"
   - Name it exactly as the folder name (e.g., `send-contact-question`)
   - Copy the contents of the `index.ts` file from that folder
   - Paste it into the function editor
   - Click "Deploy"

**Functions to deploy:**
- `send-contact-question` - Sends email notifications when someone asks a question
- `send-newsletter-email` - Sends blog post notifications to subscribers
- `send-newsletter-confirmation` - Sends welcome email to new subscribers
- `send-application-notification` - Sends confirmation for community applications

### 3. Environment Variables

The `.env` file in your project already contains the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ovfrkfddnifxnckrfcyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
RESEND_API_KEY=re_SR1Pg6vg_MCMTqhA1orqwhUJCxDYEARD9
ADMIN_EMAIL=financialfolksblog@gmail.com
```

These environment variables are already configured in Bolt, so you don't need to do anything!

### 4. Access the Admin Panel

1. Go to your website
2. Click on the "Admin" link in the navigation (or go to `/#admin`)
3. Enter the admin password: `mangorocks!`
4. You'll see the admin dashboard with tabs for:
   - **Blog Posts** - Create, edit, publish blog posts
   - **Questions** - View and respond to questions
   - **Resources** - Manage educational resources
   - **Gallery** - Manage photo gallery

### 5. Creating Your First Blog Post

1. Log into the admin panel
2. Go to the "Blog Posts" tab
3. Click "Create New Post"
4. Fill in:
   - **Title**: The blog post title (e.g., "Understanding Allowance")
   - **Excerpt**: A short summary for the blog listing page
   - **Featured Image URL**: Use Imgur or other image hosting (e.g., https://i.imgur.com/example.png)
   - **Content**: Write your blog post with formatting
   - **Author**: Your name (default is "Arjun Mamidi")
   - **Category**: Optional tag (not used for filtering)
   - **Slug**: Optional custom URL (auto-generated from title if empty)
5. Click "Save as Draft" - this creates the post but doesn't publish it
6. Review the post in the list
7. When ready, click "Publish & Send" to publish and notify subscribers

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Admin Dashboard Features

### Blog Management
- Create new blog posts with rich text content
- Upload featured images (use Imgur or other image hosting)
- Save as draft or publish immediately
- Edit existing posts
- Publish/unpublish posts
- Delete posts

### Questions Management
- View all questions submitted by visitors
- Mark questions as "replied" or "pending"
- Delete questions after responding
- Each question shows the visitor's name, type (student/parent/other), and message

### Resources Management
- Add educational resources (worksheets, activities, etc.)
- Each resource has a title, description, and link (Google Docs or external URL)
- Edit or delete resources
- Resources appear on the Resources page

### Gallery Management
- Add photos from community events
- Upload images to Imgur, then paste the URL
- Add optional captions
- Photos appear on the Explore page
- Edit or delete photos

## Database Tables Overview

### blog_posts
Blog articles with title, content, excerpt, featured image, category, author, publish status, and SEO-friendly slug.

### comments
User comments on blog posts with approval system (currently not actively used).

### community_members
Member applications (not actively used in current setup).

### newsletter_subscribers
Email addresses of subscribers who want blog post notifications.

### contact_questions
Questions submitted through the "Ask a Question" page, with replied status tracking.

### resources
Educational resources like worksheets, activities, and guides with titles, descriptions, and links.

### gallery_photos
Photo gallery with image URLs (Imgur links) and optional captions.

## Security

- Row Level Security (RLS) enabled on all tables
- Public read access for published content
- Public write access for submissions (admin panel protected by password)
- Admin operations protected by password authentication in the application
- All database operations use the Supabase anon key (public access controlled by RLS policies)

## Email Functionality

The platform uses Resend for sending emails:
- **Newsletter notifications**: When you publish a blog post, subscribers automatically receive an email
- **Question notifications**: When someone submits a question, you receive an email notification
- **Welcome emails**: New subscribers receive a welcome email

Email service is configured with your RESEND_API_KEY and ADMIN_EMAIL.

## Troubleshooting

### Database connection issues
- Verify the SQL migration was run successfully in Supabase SQL Editor
- Check that your Supabase project is active (not paused)
- Ensure environment variables are correctly set

### Edge functions not working
- Verify all 4 edge functions were deployed to Supabase
- Check the Supabase Edge Functions logs for errors
- Ensure RESEND_API_KEY is set in your environment

### Admin panel not loading data
- Make sure you ran the SQL migration first
- Check the browser console for errors
- Verify the admin password is correct: `mangorocks!`

### Images not displaying
- Make sure you're using direct image URLs (e.g., https://i.imgur.com/example.png)
- Imgur links must be direct image links, not album links
- Test the image URL in a browser first before adding to the site

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Check the Supabase logs in your dashboard
3. Verify all migration steps were completed
4. Contact your developer for assistance

## License

This project is proprietary software created for Financial Folks.

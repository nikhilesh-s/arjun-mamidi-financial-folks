# Materia MSE - Materials Science Community Platform

A modern, full-featured materials science community platform built with Next.js, Supabase, and TypeScript.

## Features

- **Blog System**: Full-featured blog with categories, search, and comments
- **Community Management**: Member applications and approval system
- **Newsletter**: Email subscription and automated notifications
- **Admin Dashboard**: Complete admin interface for content management
- **Responsive Design**: Beautiful, mobile-first design with dark mode support
- **Email Integration**: Automated emails for subscriptions and applications

## Tech Stack

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions)
- **Email**: Resend API
- **Deployment**: Netlify
- **Icons**: Tabler Icons

## Setup Instructions

### 1. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API and copy your:
   - Project URL
   - Anon public key
   - Service role key (for admin functions)

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Email Configuration (optional)
RESEND_API_KEY=your_resend_api_key_here
ADMIN_EMAIL=admin@yourdomain.com
```

### 3. Database Setup

The database schema will be automatically created when you first connect to Supabase. The migrations include:

- **blog_posts**: Blog content management
- **comments**: Blog post comments (with approval system)
- **community_members**: Member applications and management
- **newsletter_subscribers**: Email subscription management

### 4. Email Setup (Optional)

For email functionality:

1. Sign up at [resend.com](https://resend.com)
2. Get your API key
3. Add it to your environment variables
4. Configure your domain for sending emails

### 5. Edge Functions

The following Supabase Edge Functions are included:

- **send-newsletter-confirmation**: Sends welcome emails to newsletter subscribers
- **send-application-notification**: Sends confirmation emails for community applications
- **send-newsletter-email**: Sends blog post notifications to subscribers

These functions will work automatically once your Supabase project is set up.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

The project is configured for Netlify deployment with the included `netlify.toml` file.

### Environment Variables for Production

Make sure to set these environment variables in your Netlify dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (optional)
- `ADMIN_EMAIL` (optional)

## Usage

### Admin Access

Navigate to `/#admin` to access the admin dashboard. Here you can:

- Manage blog posts (publish/unpublish)
- Review and approve community member applications
- View newsletter subscribers
- Send newsletter emails when publishing posts

### Content Management

- Blog posts are managed through the admin dashboard
- Comments require approval before appearing
- Community applications go through an approval process
- Newsletter subscriptions are automatic but can be managed

### Fallback Behavior

The application gracefully handles missing Supabase configuration:

- Shows sample blog posts when database is not connected
- Displays helpful setup instructions in admin panel
- Continues to function for basic browsing without backend

## Database Tables

### blog_posts
- Content management for blog articles
- Supports drafts and published states
- Includes featured images, categories, and SEO-friendly slugs

### comments
- User comments on blog posts
- Approval system for moderation
- Links to blog posts via slug

### community_members
- Member application system
- Multiple member types (Explorer, Contributor, Builder, Connector)
- Approval workflow for admins

### newsletter_subscribers
- Email subscription management
- Active/inactive status tracking
- Integration with email notifications

## Security

- Row Level Security (RLS) enabled on all tables
- Public read access for published content
- Admin functions require proper authentication
- Email addresses are validated and sanitized

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
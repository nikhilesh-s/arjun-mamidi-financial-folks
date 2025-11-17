# Financial Folks - Kids Financial Literacy Platform

A modern web application for teaching financial literacy to children through engaging content, activities, and community resources.

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Production Build

```bash
npm run build
npm run start
```

## Deployment to Bolt.new

### Important: Set Environment Variables

Before deploying, configure these environment variables in Bolt.new dashboard:

```
NEXT_PUBLIC_SUPABASE_URL=https://ovfrkfddnifxnckrfcyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZnJrZmRkbmlmeG5ja3JmY3lqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjA5NDUsImV4cCI6MjA3ODg5Njk0NX0.KmOks97jywnXblX9tKHlWdllIx5vSNOoV8y9kcJue3Y
RESEND_API_KEY=re_SR1Pg6vg_MCMTqhA1orqwhUJCxDYEARD9
ADMIN_EMAIL=financialfolksblog@gmail.com
```

### Deploy

1. Push code to your repository
2. Set environment variables in Bolt.new
3. Click "Deploy" or "Redeploy"
4. Wait for build to complete
5. Access your site at the Bolt URL

## Features

- Blog with admin panel for content management
- Newsletter subscription system
- Question submission and management
- Resource library
- Photo gallery
- Community applications
- Email notifications via Resend

## Admin Panel

Access the admin panel at `/#admin`

Default password: `mangorocks!`

## Tech Stack

- Next.js 13.5.1
- React 18
- TypeScript
- Tailwind CSS
- Supabase (Database + Edge Functions)
- Resend (Email)

## Project Structure

```
project/
├── app/              # Next.js app router
├── components/       # React components
│   ├── pages/       # Page components
│   └── ui/          # UI components
├── lib/             # Utilities
├── supabase/        # Supabase migrations & functions
└── public/          # Static assets
```

## Database Setup

See `DEPLOYMENT_GUIDE.md` for complete setup instructions including:
- Running SQL migrations
- Deploying edge functions
- Configuring environment variables

## Troubleshooting

If you see a 404 error or Bolt preview doesn't work:

1. Verify environment variables are set in Bolt
2. Trigger a fresh deployment
3. Check build logs for errors
4. Clear browser cache

See `CHANGES_SUMMARY.md` for details on the latest fixes.

## Documentation

- `DEPLOYMENT_GUIDE.md` - Complete setup guide
- `CHANGES_SUMMARY.md` - Recent fixes and updates
- `BOLT_TROUBLESHOOTING.md` - Deployment troubleshooting
- `BOLT_DEPLOYMENT_FIX.md` - Specific 404 fix guide

## License

Private project

## Contact

For support, contact: financialfolksblog@gmail.com

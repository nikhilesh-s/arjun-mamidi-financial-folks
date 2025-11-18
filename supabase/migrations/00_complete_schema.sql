/*
  # Complete Database Schema for Financial Folks

  This migration creates all necessary tables for the Financial Folks application.
  Run this in your Supabase SQL Editor to set up the complete database schema.

  ## Tables Created

  1. **blog_posts** - Blog articles with full content
     - id (uuid, primary key)
     - title (text, required)
     - content (text, required) - Full HTML content
     - excerpt (text, required) - Short summary
     - featured_image (text, optional) - Image URL
     - category (text, default 'Basics')
     - author (text, default 'Arjun Mamidi')
     - published (boolean, default false)
     - slug (text, unique, required) - URL-friendly identifier
     - created_at (timestamptz)
     - updated_at (timestamptz)

  2. **comments** - Blog post comments
     - id (uuid, primary key)
     - post_id (text, required) - References blog_posts.slug
     - author_name (text, required)
     - author_email (text, required)
     - content (text, required)
     - approved (boolean, default false)
     - created_at (timestamptz)

  3. **community_members** - Community member applications
     - id (uuid, primary key)
     - full_name (text, required)
     - preferred_name (text, optional)
     - email (text, unique, required)
     - school_organization (text, optional)
     - grade_year (text, optional)
     - location (text, optional)
     - member_type (text, required) - student/parent/educator/other
     - goals (text, required)
     - interests (text array)
     - linkedin_website (text, optional)
     - newsletter_opt_in (boolean, default true)
     - how_heard (text, optional)
     - approved (boolean, default false)
     - created_at (timestamptz)

  4. **newsletter_subscribers** - Email newsletter subscribers
     - id (uuid, primary key)
     - email (text, unique, required)
     - subscribed_at (timestamptz)
     - active (boolean, default true)

  5. **contact_questions** - Questions from visitors
     - id (uuid, primary key)
     - name (text, required)
     - email (text, required)
     - subject (text, default '')
     - message (text, required)
     - created_at (timestamptz)
     - replied (boolean, default false)
     - admin_notes (text, default '')

  6. **resources** - Educational resources
     - id (uuid, primary key)
     - title (text, required)
     - description (text, required)
     - link (text, required) - Google Doc or external URL
     - created_at (timestamptz)
     - updated_at (timestamptz)
     - display_order (integer, default 0)

  7. **gallery_photos** - Photo gallery
     - id (uuid, primary key)
     - photo_url (text, required) - Imgur or other image URL
     - caption (text, default '')
     - created_at (timestamptz)
     - display_order (integer, default 0)

  ## Security

  All tables have Row Level Security (RLS) enabled.
  Policies allow:
  - Public read access for published/approved content
  - Public write access for submissions (protected by admin password in application)
  - Public admin operations (protected by admin password in application)

  ## Performance

  Indexes are created on frequently queried columns for optimal performance.
*/

-- ============================================================================
-- RESET EXISTING SCHEMA (DROP TABLES IF THEY EXIST)
-- ============================================================================
DO $$
BEGIN
  EXECUTE 'DROP TABLE IF EXISTS gallery_photos CASCADE';
  EXECUTE 'DROP TABLE IF EXISTS resources CASCADE';
  EXECUTE 'DROP TABLE IF EXISTS contact_questions CASCADE';
  EXECUTE 'DROP TABLE IF EXISTS newsletter_subscribers CASCADE';
  EXECUTE 'DROP TABLE IF EXISTS community_members CASCADE';
  EXECUTE 'DROP TABLE IF EXISTS comments CASCADE';
  EXECUTE 'DROP TABLE IF EXISTS blog_posts CASCADE';
END $$;

-- ============================================================================
-- CREATE TABLES
-- ============================================================================

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  featured_image text,
  category text NOT NULL DEFAULT 'Basics',
  author text NOT NULL DEFAULT 'Arjun Mamidi',
  published boolean DEFAULT false,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Community Members Table
CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  preferred_name text,
  email text UNIQUE NOT NULL,
  school_organization text,
  grade_year text,
  location text,
  member_type text NOT NULL,
  goals text NOT NULL,
  interests text[] DEFAULT '{}',
  linkedin_website text,
  newsletter_opt_in boolean DEFAULT true,
  how_heard text,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Contact Questions Table
CREATE TABLE IF NOT EXISTS contact_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text DEFAULT '',
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  replied boolean DEFAULT false,
  admin_notes text DEFAULT ''
);

-- Resources Table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  link text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0
);

-- Gallery Photos Table
CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL,
  caption text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES - BLOG POSTS
-- ============================================================================

-- Anyone can read published blog posts
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Anyone can read all blog posts (for admin panel)
CREATE POLICY "Public can read all blog posts"
  ON blog_posts FOR SELECT
  USING (true);

-- Anyone can insert blog posts (admin panel protected by password)
CREATE POLICY "Public can insert blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (true);

-- Anyone can update blog posts (admin panel protected by password)
CREATE POLICY "Public can update blog posts"
  ON blog_posts FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Anyone can delete blog posts (admin panel protected by password)
CREATE POLICY "Public can delete blog posts"
  ON blog_posts FOR DELETE
  USING (true);

-- ============================================================================
-- CREATE RLS POLICIES - COMMENTS
-- ============================================================================

-- Anyone can read approved comments
CREATE POLICY "Anyone can read approved comments"
  ON comments FOR SELECT
  USING (approved = true);

-- Anyone can read all comments (for admin panel)
CREATE POLICY "Public can read all comments"
  ON comments FOR SELECT
  USING (true);

-- Anyone can insert comments
CREATE POLICY "Public can insert comments"
  ON comments FOR INSERT
  WITH CHECK (true);

-- Anyone can update comments (admin panel protected by password)
CREATE POLICY "Public can update comments"
  ON comments FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Anyone can delete comments (admin panel protected by password)
CREATE POLICY "Public can delete comments"
  ON comments FOR DELETE
  USING (true);

-- ============================================================================
-- CREATE RLS POLICIES - COMMUNITY MEMBERS
-- ============================================================================

-- Anyone can read approved members
CREATE POLICY "Anyone can read approved members"
  ON community_members FOR SELECT
  USING (approved = true);

-- Anyone can read all members (for admin panel)
CREATE POLICY "Public can read all members"
  ON community_members FOR SELECT
  USING (true);

-- Anyone can insert member applications
CREATE POLICY "Public can insert member applications"
  ON community_members FOR INSERT
  WITH CHECK (true);

-- Anyone can update members (admin panel protected by password)
CREATE POLICY "Public can update members"
  ON community_members FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Anyone can delete members (admin panel protected by password)
CREATE POLICY "Public can delete members"
  ON community_members FOR DELETE
  USING (true);

-- ============================================================================
-- CREATE RLS POLICIES - NEWSLETTER SUBSCRIBERS
-- ============================================================================

-- Anyone can view newsletter subscribers (for admin)
CREATE POLICY "Public can view newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (true);

-- Anyone can subscribe to newsletter
CREATE POLICY "Public can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

-- Anyone can update newsletter subscriptions (for unsubscribe)
CREATE POLICY "Public can update newsletter subscriptions"
  ON newsletter_subscribers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- CREATE RLS POLICIES - CONTACT QUESTIONS
-- ============================================================================

-- Anyone can submit contact questions
CREATE POLICY "Public can submit contact questions"
  ON contact_questions FOR INSERT
  WITH CHECK (true);

-- Anyone can view contact questions (for admin panel)
CREATE POLICY "Public can view contact questions"
  ON contact_questions FOR SELECT
  USING (true);

-- Anyone can update contact questions (admin panel protected by password)
CREATE POLICY "Public can update contact questions"
  ON contact_questions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Anyone can delete contact questions (admin panel protected by password)
CREATE POLICY "Public can delete contact questions"
  ON contact_questions FOR DELETE
  USING (true);

-- ============================================================================
-- CREATE RLS POLICIES - RESOURCES
-- ============================================================================

-- Anyone can view resources
CREATE POLICY "Public can view resources"
  ON resources FOR SELECT
  USING (true);

-- Anyone can insert resources (admin panel protected by password)
CREATE POLICY "Public can insert resources"
  ON resources FOR INSERT
  WITH CHECK (true);

-- Anyone can update resources (admin panel protected by password)
CREATE POLICY "Public can update resources"
  ON resources FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Anyone can delete resources (admin panel protected by password)
CREATE POLICY "Public can delete resources"
  ON resources FOR DELETE
  USING (true);

-- ============================================================================
-- CREATE RLS POLICIES - GALLERY PHOTOS
-- ============================================================================

-- Anyone can view gallery photos
CREATE POLICY "Public can view gallery photos"
  ON gallery_photos FOR SELECT
  USING (true);

-- Anyone can insert gallery photos (admin panel protected by password)
CREATE POLICY "Public can insert gallery photos"
  ON gallery_photos FOR INSERT
  WITH CHECK (true);

-- Anyone can update gallery photos (admin panel protected by password)
CREATE POLICY "Public can update gallery photos"
  ON gallery_photos FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Anyone can delete gallery photos (admin panel protected by password)
CREATE POLICY "Public can delete gallery photos"
  ON gallery_photos FOR DELETE
  USING (true);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Blog posts indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Community members indexes
CREATE INDEX IF NOT EXISTS idx_community_members_approved ON community_members(approved);
CREATE INDEX IF NOT EXISTS idx_community_members_email ON community_members(email);
CREATE INDEX IF NOT EXISTS idx_community_members_created_at ON community_members(created_at DESC);

-- Newsletter subscribers indexes
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(active);

-- Contact questions indexes
CREATE INDEX IF NOT EXISTS idx_contact_questions_replied ON contact_questions(replied);
CREATE INDEX IF NOT EXISTS idx_contact_questions_created_at ON contact_questions(created_at DESC);

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_display_order ON resources(display_order);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

-- Gallery photos indexes
CREATE INDEX IF NOT EXISTS idx_gallery_photos_display_order ON gallery_photos(display_order);
CREATE INDEX IF NOT EXISTS idx_gallery_photos_created_at ON gallery_photos(created_at DESC);

-- ============================================================================
-- SEED SAMPLE DATA (IDEMPOTENT)
-- ============================================================================

INSERT INTO blog_posts (title, content, excerpt, featured_image, category, author, published, slug)
VALUES
(
  'Why Materials Matter More Than You Think',
  '<p>Materials science is everywhere around us, from the smartphone in your pocket to the buildings we live in. Understanding materials helps us innovate and solve real-world problems.</p><p>In this post, we''ll explore how different materials shape our daily lives and why studying them is crucial for future innovations.</p><h2>The Building Blocks of Innovation</h2><p>Every technological advancement relies on materials. Whether it''s developing stronger, lighter composites for aerospace or creating biodegradable plastics for environmental sustainability, materials science is at the heart of progress.</p>',
  'A beginner''s guide to how materials shape our daily lives—from toothbrushes to space travel.',
  'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg',
  'Basics',
  'Arjun Mamidi',
  true,
  'why-materials-matter-more-than-you-think'
),
(
  'Plastic Isn''t the Problem: Understanding Polymers',
  '<p>Polymers often get a bad reputation due to plastic pollution, but they''re actually incredible materials with vast potential for sustainability.</p><p>Let''s dive into what polymers really are and how they can be part of the solution to environmental challenges.</p><h2>What Are Polymers?</h2><p>Polymers are large molecules made up of repeating units called monomers. They can be natural (like DNA and proteins) or synthetic (like plastics).</p><h2>Sustainable Polymer Solutions</h2><p>Modern polymer science is developing biodegradable plastics, recyclable materials, and bio-based polymers that could revolutionize how we think about sustainability.</p>',
  'A fresh take on plastics and their overlooked potential in sustainability.',
  'https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg',
  'Polymers',
  'Arjun Mamidi',
  true,
  'plastic-isnt-the-problem-understanding-polymers'
),
(
  'Steel vs. Aluminum: The Ultimate Face-Off',
  '<p>Two of the most important metals in modern engineering go head-to-head. Which one comes out on top?</p><p>In this comprehensive comparison, we''ll examine strength, weight, cost, corrosion resistance, and environmental impact.</p><h2>Strength and Durability</h2><p>Steel generally offers superior strength and durability, making it ideal for structural applications. However, aluminum''s strength-to-weight ratio tells a different story.</p><h2>Weight Considerations</h2><p>Aluminum is significantly lighter than steel, making it the preferred choice for aerospace and automotive applications where weight reduction is crucial.</p><h2>Cost Analysis</h2><p>While steel is typically less expensive initially, aluminum''s recyclability and longevity can make it more cost-effective in the long run.</p>',
  'Which metal wins in strength, cost, weight, and versatility?',
  'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg',
  'Metals',
  'Arjun Mamidi',
  true,
  'steel-vs-aluminum-the-ultimate-face-off'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================

-- All tables, RLS policies, and indexes have been created successfully.
-- Your database is ready to use with the Financial Folks application.

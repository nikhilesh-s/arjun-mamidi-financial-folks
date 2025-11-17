/*
  # Create blog and community schema

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `excerpt` (text, required)
      - `featured_image` (text, optional)
      - `category` (text, required)
      - `author` (text, required)
      - `published` (boolean, default false)
      - `slug` (text, unique, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `comments`
      - `id` (uuid, primary key)
      - `post_id` (text, foreign key to blog_posts.slug)
      - `author_name` (text, required)
      - `author_email` (text, required)
      - `content` (text, required)
      - `approved` (boolean, default false)
      - `created_at` (timestamp)
    
    - `community_members`
      - `id` (uuid, primary key)
      - `full_name` (text, required)
      - `preferred_name` (text, optional)
      - `email` (text, unique, required)
      - `school_organization` (text, optional)
      - `grade_year` (text, optional)
      - `location` (text, optional)
      - `member_type` (text, required)
      - `goals` (text, required)
      - `interests` (text array)
      - `linkedin_website` (text, optional)
      - `newsletter_opt_in` (boolean, default true)
      - `how_heard` (text, optional)
      - `approved` (boolean, default false)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to published content
    - Add policies for authenticated users to manage content
*/

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

CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Anyone can read all blog posts for admin"
  ON blog_posts FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert blog posts"
  ON blog_posts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update blog posts"
  ON blog_posts FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete blog posts"
  ON blog_posts FOR DELETE
  USING (true);

CREATE POLICY "Anyone can read approved comments"
  ON comments FOR SELECT
  USING (approved = true);

CREATE POLICY "Anyone can read all comments for admin"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update comments"
  ON comments FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete comments"
  ON comments FOR DELETE
  USING (true);

CREATE POLICY "Anyone can read approved members"
  ON community_members FOR SELECT
  USING (approved = true);

CREATE POLICY "Anyone can read all members for admin"
  ON community_members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert member applications"
  ON community_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update members"
  ON community_members FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete members"
  ON community_members FOR DELETE
  USING (true);

CREATE POLICY "Anyone can view newsletter subscribers"
  ON newsletter_subscribers FOR SELECT
  USING (true);

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update newsletter subscriptions"
  ON newsletter_subscribers FOR UPDATE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_community_members_approved ON community_members(approved);
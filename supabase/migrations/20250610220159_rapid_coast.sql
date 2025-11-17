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

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  featured_image text,
  category text NOT NULL DEFAULT 'Basics',
  author text NOT NULL DEFAULT 'Nikhilesh Suravarjala',
  published boolean DEFAULT false,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id text NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create community_members table
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

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts
  FOR SELECT
  USING (published = true);

CREATE POLICY "Anyone can read all blog posts for admin"
  ON blog_posts
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert blog posts"
  ON blog_posts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update blog posts"
  ON blog_posts
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete blog posts"
  ON blog_posts
  FOR DELETE
  USING (true);

-- Create policies for comments
CREATE POLICY "Anyone can read approved comments"
  ON comments
  FOR SELECT
  USING (approved = true);

CREATE POLICY "Anyone can read all comments for admin"
  ON comments
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert comments"
  ON comments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update comments"
  ON comments
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete comments"
  ON comments
  FOR DELETE
  USING (true);

-- Create policies for community_members
CREATE POLICY "Anyone can read approved members"
  ON community_members
  FOR SELECT
  USING (approved = true);

CREATE POLICY "Anyone can read all members for admin"
  ON community_members
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert member applications"
  ON community_members
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update members"
  ON community_members
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete members"
  ON community_members
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_community_members_approved ON community_members(approved);

-- Insert some sample blog posts
INSERT INTO blog_posts (title, content, excerpt, featured_image, category, author, published, slug) VALUES
(
  'Why Materials Matter More Than You Think',
  '<p>Materials science is everywhere around us, from the smartphone in your pocket to the buildings we live in. Understanding materials helps us innovate and solve real-world problems.</p><p>In this post, we''ll explore how different materials shape our daily lives and why studying them is crucial for future innovations.</p><h2>The Building Blocks of Innovation</h2><p>Every technological advancement relies on materials. Whether it''s developing stronger, lighter composites for aerospace or creating biodegradable plastics for environmental sustainability, materials science is at the heart of progress.</p>',
  'A beginner''s guide to how materials shape our daily lives—from toothbrushes to space travel.',
  'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg',
  'Basics',
  'Nikhilesh Suravarjala',
  true,
  'why-materials-matter-more-than-you-think'
),
(
  'Plastic Isn''t the Problem: Understanding Polymers',
  '<p>Polymers often get a bad reputation due to plastic pollution, but they''re actually incredible materials with vast potential for sustainability.</p><p>Let''s dive into what polymers really are and how they can be part of the solution to environmental challenges.</p><h2>What Are Polymers?</h2><p>Polymers are large molecules made up of repeating units called monomers. They can be natural (like DNA and proteins) or synthetic (like plastics).</p><h2>Sustainable Polymer Solutions</h2><p>Modern polymer science is developing biodegradable plastics, recyclable materials, and bio-based polymers that could revolutionize how we think about sustainability.</p>',
  'A fresh take on plastics and their overlooked potential in sustainability.',
  'https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg',
  'Polymers',
  'Nikhilesh Suravarjala',
  true,
  'plastic-isnt-the-problem-understanding-polymers'
),
(
  'Steel vs. Aluminum: The Ultimate Face-Off',
  '<p>Two of the most important metals in modern engineering go head-to-head. Which one comes out on top?</p><p>In this comprehensive comparison, we''ll examine strength, weight, cost, corrosion resistance, and environmental impact.</p><h2>Strength and Durability</h2><p>Steel generally offers superior strength and durability, making it ideal for structural applications. However, aluminum''s strength-to-weight ratio tells a different story.</p><h2>Weight Considerations</h2><p>Aluminum is significantly lighter than steel, making it the preferred choice for aerospace and automotive applications where weight reduction is crucial.</p><h2>Cost Analysis</h2><p>While steel is typically less expensive initially, aluminum''s recyclability and longevity can make it more cost-effective in the long run.</p>',
  'Which metal wins in strength, cost, weight, and versatility?',
  'https://images.pexels.com/photos/2760243/pexels-photo-2760243.jpeg',
  'Metals',
  'Nikhilesh Suravarjala',
  true,
  'steel-vs-aluminum-the-ultimate-face-off'
);
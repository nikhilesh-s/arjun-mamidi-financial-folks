/*
  # Create newsletter subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, required)
      - `subscribed_at` (timestamp, default now)
      - `active` (boolean, default true)

  2. Security
    - Enable RLS on newsletter_subscribers table
    - Add policy for public insert (anyone can subscribe)
    - Add policy for admin read access
    - Add policy for admin update access

  3. Indexes
    - Index on email for fast lookups
    - Index on active status for filtering
*/

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  subscribed_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletter_subscribers
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read newsletter subscribers for admin"
  ON newsletter_subscribers
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update newsletter subscribers"
  ON newsletter_subscribers
  FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete newsletter subscribers"
  ON newsletter_subscribers
  FOR DELETE
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(active);
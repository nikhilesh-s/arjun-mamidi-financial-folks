/*
  # Add Resources and Gallery Tables

  1. New Tables
    - `resources`
      - `id` (uuid, primary key)
      - `title` (text, not null) - Resource title
      - `description` (text, not null) - Paragraph description of the resource
      - `link` (text, not null) - Google Doc link or other external link
      - `created_at` (timestamptz) - When the resource was added
      - `updated_at` (timestamptz) - Last update timestamp
      - `display_order` (integer) - For custom ordering of resources
    
    - `gallery_photos`
      - `id` (uuid, primary key)
      - `photo_url` (text, not null) - Imgur link or other image URL
      - `caption` (text) - Optional caption for the photo
      - `created_at` (timestamptz) - When the photo was added
      - `display_order` (integer) - For custom ordering of photos

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for authenticated admin operations
*/

CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  link text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS gallery_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url text NOT NULL,
  caption text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  display_order integer DEFAULT 0
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view resources"
  ON resources FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view gallery photos"
  ON gallery_photos FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert resources"
  ON resources FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update resources"
  ON resources FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete resources"
  ON resources FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert gallery photos"
  ON gallery_photos FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gallery photos"
  ON gallery_photos FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete gallery photos"
  ON gallery_photos FOR DELETE
  TO authenticated
  USING (true);
/*
  # Add Contact Questions Table

  1. New Tables
    - `contact_questions`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Name of person asking question
      - `email` (text, not null) - Email of person asking question
      - `subject` (text) - Optional subject line
      - `message` (text, not null) - The question/message content
      - `created_at` (timestamptz) - When the question was submitted
      - `replied` (boolean) - Whether admin has replied
      - `admin_notes` (text) - Optional notes for admin

  2. Security
    - Enable RLS on contact_questions table
    - Add policy for public insert (anyone can submit)
    - Add policy for authenticated users to view/update (admin only)
*/

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

ALTER TABLE contact_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact questions"
  ON contact_questions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view contact questions"
  ON contact_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact questions"
  ON contact_questions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contact questions"
  ON contact_questions FOR DELETE
  TO authenticated
  USING (true);
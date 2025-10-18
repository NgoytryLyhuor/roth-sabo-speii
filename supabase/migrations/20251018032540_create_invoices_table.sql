/*
  # Create invoices table

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key) - Unique invoice identifier
      - `customer_name` (text) - Customer name
      - `date` (date) - Invoice date
      - `currency` (text) - Currency type (USD or KHR)
      - `items` (jsonb) - Array of invoice items with product details
      - `subtotal` (numeric) - Calculated subtotal
      - `discount_percent` (numeric) - Discount percentage
      - `total` (numeric) - Final total amount
      - `seller_name` (text) - Seller name (default: Sreyroth)
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
  
  2. Security
    - Enable RLS on `invoices` table
    - Add policies for public access (since this is a simple invoice tool)
*/

CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  date date NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  items jsonb NOT NULL DEFAULT '[]',
  subtotal numeric(12, 2) NOT NULL DEFAULT 0,
  discount_percent numeric(5, 2) NOT NULL DEFAULT 0,
  total numeric(12, 2) NOT NULL DEFAULT 0,
  seller_name text NOT NULL DEFAULT 'Sreyroth',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Allow public access for this simple tool
CREATE POLICY "Allow public read access"
  ON invoices FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access"
  ON invoices FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON invoices FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access"
  ON invoices FOR DELETE
  TO anon
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS invoices_date_idx ON invoices(date);
CREATE INDEX IF NOT EXISTS invoices_created_at_idx ON invoices(created_at);
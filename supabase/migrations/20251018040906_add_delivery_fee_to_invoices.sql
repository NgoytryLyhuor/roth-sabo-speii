/*
  # Add delivery fee to invoices table

  1. Changes
    - Add `delivery_fee` column to `invoices` table
      - `delivery_fee` (numeric) - Delivery fee amount (default: 0)
  
  2. Notes
    - This field allows tracking delivery charges separately
    - Defaults to 0 for invoices without delivery fees
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'delivery_fee'
  ) THEN
    ALTER TABLE invoices ADD COLUMN delivery_fee numeric(12, 2) NOT NULL DEFAULT 0;
  END IF;
END $$;
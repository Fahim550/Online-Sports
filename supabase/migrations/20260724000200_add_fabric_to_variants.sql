-- Add fabric column to product_variants table
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS fabric text;

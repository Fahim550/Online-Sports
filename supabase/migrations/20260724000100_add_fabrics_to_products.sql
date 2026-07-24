-- Add fabrics column to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS fabrics text;

-- Create product_variants table
CREATE TABLE public.product_variants (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    size TEXT,
    color TEXT,
    sku TEXT NOT NULL,
    price_adjustment NUMERIC DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active variants"
ON public.product_variants FOR SELECT
USING ((is_active = true) OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage variants"
ON public.product_variants FOR ALL
USING (is_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_product_variants_updated_at
    BEFORE UPDATE ON public.product_variants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();


-- Add is_variable flag to products (default false = simple product)
ALTER TABLE public.products ADD COLUMN is_variable boolean NOT NULL DEFAULT false;

-- Add variant_price to product_variants (independent price per variant)
ALTER TABLE public.product_variants ADD COLUMN variant_price numeric NULL;


ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hide_stock BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.product_variants ADD COLUMN variant_sale_price numeric NULL;

ALTER TABLE public.products ADD COLUMN specifications jsonb NULL DEFAULT NULL;

-- Add variant columns to order_items
ALTER TABLE public.order_items 
ADD COLUMN IF NOT EXISTS variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS variant_info JSONB;
-- Create global_fabric_pricing table
CREATE TABLE IF NOT EXISTS public.global_fabric_pricing (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    fabric_name text NOT NULL,
    short_sleeve_price numeric NOT NULL DEFAULT 0,
    long_sleeve_price numeric NOT NULL DEFAULT 0,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.global_fabric_pricing ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON public.global_fabric_pricing
    FOR SELECT USING (true);

CREATE POLICY "Enable all access for admins only" ON public.global_fabric_pricing
    FOR ALL USING (auth.role() = 'authenticated'); -- Adjust as needed based on admin role

-- Seed initial data
INSERT INTO public.global_fabric_pricing (fabric_name, short_sleeve_price, long_sleeve_price, sort_order) VALUES
('PP 160 GSM Jersey', 260, 280, 1),
('PP 180 GSM Jersey', 280, 300, 2),
('PP China Micro Player Edition Jersey', 500, 550, 3),
('Mesh Fabric Jersey', 320, 350, 4),
('Box Mesh Fabric Jersey', 300, 320, 5),
('Honeycomb Mesh Jersey', 330, 350, 6),
('Ball Mesh Fabric Jersey', 350, 380, 7),
('Rolex Mesh Fabric Jersey', 380, 400, 8),
('Leap Jacquard Player Edition Copy Jersey', 360, 380, 9),
('Leap Jacquard Player Edition Original Jersey', 400, 450, 10),
('Brush Fabric Player Edition Jersey', 500, 550, 11),
('Chamoch Fabric Player Edition Jersey', 600, 650, 12);

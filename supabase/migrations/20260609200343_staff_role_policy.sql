-- =============================================
-- PHASE 6: Staff Roles - Add enum values first
-- =============================================


-- Staff Role Functions
CREATE OR REPLACE FUNCTION public.has_any_staff_role(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('admin', 'manager', 'order_handler')
    )
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_orders(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('admin', 'manager', 'order_handler')
    )
$$;

CREATE OR REPLACE FUNCTION public.can_manage_products(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role IN ('admin', 'manager')
    )
$$;

-- RLS Policy Updates for Staff Roles
DROP POLICY IF EXISTS "Users can view their own orders or admins all" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders or staff all" ON public.orders;
CREATE POLICY "Users can view their own orders or staff all"
ON public.orders FOR SELECT
USING ((user_id = auth.uid()) OR can_manage_orders(auth.uid()) OR (user_id IS NULL));

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
CREATE POLICY "Staff can update orders"
ON public.orders FOR UPDATE
USING (can_manage_orders(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
DROP POLICY IF EXISTS "Staff can manage products" ON public.products;
CREATE POLICY "Staff can manage products"
ON public.products FOR ALL
USING (can_manage_products(auth.uid()));
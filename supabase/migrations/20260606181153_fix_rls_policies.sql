-- Drop the old policies
DROP POLICY IF EXISTS "Admins can manage videos" ON videos;
DROP POLICY IF EXISTS "Public can view videos" ON videos;
DROP POLICY IF EXISTS "Admins can manage tiers" ON price_tiers;
DROP POLICY IF EXISTS "Public can view active tiers" ON price_tiers;
DROP POLICY IF EXISTS "Admins can manage invoices" ON invoices;

-- Create consolidated policies for videos
CREATE POLICY "videos_select" ON videos FOR SELECT
  USING (true);

CREATE POLICY "videos_admin" ON videos FOR ALL
  USING ((SELECT auth.uid()) IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- For price_tiers, everyone can SELECT, admin can do everything else
CREATE POLICY "price_tiers_select" ON price_tiers FOR SELECT
  USING (true);

CREATE POLICY "price_tiers_admin" ON price_tiers FOR ALL
  USING ((SELECT auth.uid()) IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

-- For invoices, only admin can access at all (no public policy)
CREATE POLICY "invoices_admin" ON invoices FOR ALL
  USING ((SELECT auth.uid()) IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
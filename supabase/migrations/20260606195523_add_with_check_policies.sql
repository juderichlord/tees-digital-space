-- Drop old admin policies that only have USING
DROP POLICY IF EXISTS "videos_admin" ON videos;
DROP POLICY IF EXISTS "price_tiers_admin" ON price_tiers;
DROP POLICY IF EXISTS "invoices_admin" ON invoices;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "videos_admin" ON videos
  FOR ALL
  USING ((SELECT auth.uid()) IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  WITH CHECK ((SELECT auth.uid()) IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "price_tiers_admin" ON price_tiers
  FOR ALL
  USING ((SELECT auth.uid()) IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  WITH CHECK ((SELECT auth.uid()) IN (SELECT user_id FROM user_roles WHERE role = 'admin'));

CREATE POLICY "invoices_admin" ON invoices
  FOR ALL
  USING ((SELECT auth.uid()) IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
  WITH CHECK ((SELECT auth.uid()) IN (SELECT user_id FROM user_roles WHERE role = 'admin'));
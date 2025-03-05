/*
  # Fix infinite recursion in profile policies

  1. Changes
    - Remove the recursive admin policies that were causing infinite recursion
    - Create new admin policies with a different approach using auth.jwt()
    - Add a function to check if a user is an admin

  2. Security
    - Maintain the same security model but with a more efficient implementation
    - Ensure admins can still view and update all profiles
    - Ensure users can only view and update their own profiles
*/

-- First, drop the problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT p.is_admin INTO is_admin
  FROM profiles p
  WHERE p.id = auth.uid();
  
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new admin policies using the function
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (public.is_admin());
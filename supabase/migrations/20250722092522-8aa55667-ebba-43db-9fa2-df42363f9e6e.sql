-- Fix infinite recursion in profiles RLS policies
-- The issue is that the "Owner can view all profiles" policy is looking at the same table it's protecting

-- Drop the problematic policies
DROP POLICY IF EXISTS "Owner can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owner can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owner can delete profiles" ON public.profiles;

-- Create a security definer function to check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'owner'
  );
$$;

-- Recreate the policies using the function to avoid recursion
CREATE POLICY "Owner can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_owner(auth.uid()) OR auth.uid() = id);

CREATE POLICY "Owner can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.is_owner(auth.uid()) OR auth.uid() = id);

CREATE POLICY "Owner can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_owner(auth.uid()) AND auth.uid() != id);
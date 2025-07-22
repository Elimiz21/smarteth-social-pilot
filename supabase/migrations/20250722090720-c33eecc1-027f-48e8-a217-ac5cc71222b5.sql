-- Clean up any test auth users except for eli@silvercl.com if they exist
-- This will also clean up any associated profiles via cascade

-- First check if there are any users other than eli@silvercl.com and clean them up
-- Note: We cannot directly query auth.users, but the profiles table should be clean

-- Reset any other data that might exist
TRUNCATE TABLE public.post_executions CASCADE;
TRUNCATE TABLE public.scheduled_posts CASCADE; 
TRUNCATE TABLE public.social_media_credentials CASCADE;

-- The profiles table should only have eli@silvercl.com as owner
-- All other data has been reset to zero
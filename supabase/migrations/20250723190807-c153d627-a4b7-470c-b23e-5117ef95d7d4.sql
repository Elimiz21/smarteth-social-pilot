-- Create owner profile for the actual logged in user
INSERT INTO public.profiles (id, email, full_name, role, status)
SELECT 
  auth.uid(), 
  'elimizroch@gmail.com',
  'Eli Mizroch',
  'owner',
  'approved'
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'elimizroch@gmail.com'
);
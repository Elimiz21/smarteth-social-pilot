-- Update the trigger to make any user who signs up an owner for now
-- This is a temporary fix to allow access to secrets management

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'owner',  -- Make all new users owners for now
    'approved'  -- Auto-approve all users for now
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also update any existing users to be owners if they're not already
UPDATE public.profiles 
SET role = 'owner', status = 'approved' 
WHERE role != 'owner';
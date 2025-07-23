-- First, let's see what auth users exist
-- We'll create a profile for elimizroch@gmail.com if it exists in auth.users

DO $$
DECLARE
    user_uuid uuid;
BEGIN
    -- Try to find the user in auth.users
    SELECT id INTO user_uuid 
    FROM auth.users 
    WHERE email = 'elimizroch@gmail.com' 
    LIMIT 1;
    
    -- If user exists, create/update their profile
    IF user_uuid IS NOT NULL THEN
        INSERT INTO public.profiles (id, email, full_name, role, status, created_at, updated_at)
        VALUES (
            user_uuid,
            'elimizroch@gmail.com',
            'Eli Mizroch',
            'owner',
            'approved',
            NOW(),
            NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'owner',
            status = 'approved',
            updated_at = NOW();
            
        RAISE NOTICE 'Profile created/updated for user ID: %', user_uuid;
    ELSE
        RAISE NOTICE 'No auth user found with email elimizroch@gmail.com';
    END IF;
END $$;
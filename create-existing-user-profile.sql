-- Run this SQL in Supabase SQL Editor to create profile for existing user
-- Replace 'your-email@example.com' with your actual email address

INSERT INTO public.profiles (id, email, plan_type, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  'free',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'your-email@example.com'  -- Replace with your actual email
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = au.id
);

-- Verify the profile was created
SELECT * FROM public.profiles;

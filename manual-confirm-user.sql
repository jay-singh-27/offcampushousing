-- Manually confirm user for testing
-- Replace 'singhjay1302@gmail.com' with the email you're testing with

UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmation_sent_at = NULL
WHERE email = 'singhjay1302@gmail.com';

-- Also make sure the user record exists in our users table
-- Check if user exists first
SELECT * FROM users WHERE email = 'singhjay1302@gmail.com';

-- If no user record exists, create one manually
-- (Replace the values with actual user data)
INSERT INTO users (id, email, name, user_type)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'name', 'Jay'),
  COALESCE(au.raw_user_meta_data->>'userType', 'landlord')
FROM auth.users au
WHERE au.email = 'singhjay1302@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = au.email
);

-- SQL script to run in your Supabase project
-- Go to: https://supabase.com/dashboard/project/xphgwzbxwwaqoaedfsoq/sql
-- Copy and paste this entire script and click "Run"

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  username TEXT,
  website TEXT,
  bio TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table (drop existing ones first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create a simple test table that allows anonymous access (for connection testing)
CREATE TABLE IF NOT EXISTS public.test_table (
  id SERIAL PRIMARY KEY,
  message TEXT DEFAULT 'Hello from Supabase!',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a test record
INSERT INTO public.test_table (message) VALUES ('Connection test successful!')
ON CONFLICT DO NOTHING;

-- Allow anonymous read access to test table (for connection testing)
ALTER TABLE public.test_table ENABLE ROW LEVEL SECURITY;

-- Drop existing test table policy to avoid conflicts
DROP POLICY IF EXISTS "Allow anonymous read access to test table" ON public.test_table;

CREATE POLICY "Allow anonymous read access to test table" ON public.test_table
  FOR SELECT USING (true);

-- Create a table for storing chat history (optional)
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for chat history
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Drop existing chat history policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own chat history" ON chat_history;
DROP POLICY IF EXISTS "Users can insert their own chat messages" ON chat_history;

-- Chat history policies
CREATE POLICY "Users can view their own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add daily usage tracking table
CREATE TABLE IF NOT EXISTS daily_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  questions_asked INTEGER DEFAULT 0,
  plan_type TEXT DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing daily_usage policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own usage" ON daily_usage;
DROP POLICY IF EXISTS "Users can update their own usage" ON daily_usage;
DROP POLICY IF EXISTS "Users can insert their own usage" ON daily_usage;

-- Create policies for daily_usage table
CREATE POLICY "Users can view their own usage" ON daily_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" ON daily_usage 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" ON daily_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create atomic function to increment daily usage and check limits
CREATE OR REPLACE FUNCTION increment_daily_usage(
  p_user_id UUID,
  p_date DATE,
  p_plan_type TEXT,
  p_limit INTEGER
) 
RETURNS TABLE(
  id UUID,
  user_id UUID,
  date DATE,
  questions_asked INTEGER,
  plan_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) 
AS $$
DECLARE
  current_count INTEGER;
  updated_record RECORD;
BEGIN
  -- First, check current usage
  SELECT COALESCE(du.questions_asked, 0) INTO current_count
  FROM daily_usage du
  WHERE du.user_id = p_user_id AND du.date = p_date;
  
  -- If current count is NULL (no record exists), set to 0
  IF current_count IS NULL THEN
    current_count := 0;
  END IF;
  
  -- Check if adding one more question would exceed limit
  IF current_count >= p_limit THEN
    -- Return empty result set if limit exceeded
    RETURN;
  END IF;
  
  -- Insert or update the record
  INSERT INTO daily_usage (user_id, date, questions_asked, plan_type, created_at, updated_at)
  VALUES (p_user_id, p_date, 1, p_plan_type, NOW(), NOW())
  ON CONFLICT (user_id, date) 
  DO UPDATE SET 
    questions_asked = daily_usage.questions_asked + 1,
    plan_type = p_plan_type,
    updated_at = NOW()
  RETURNING * INTO updated_record;
  
  -- Return the updated record
  RETURN QUERY
  SELECT updated_record.id, updated_record.user_id, updated_record.date, 
         updated_record.questions_asked, updated_record.plan_type, 
         updated_record.created_at, updated_record.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_usage_user_date ON daily_usage(user_id, date);

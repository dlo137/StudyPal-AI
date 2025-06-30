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

-- Create policies for profiles table
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

-- Chat history policies
CREATE POLICY "Users can view their own chat history" ON chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chat messages" ON chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

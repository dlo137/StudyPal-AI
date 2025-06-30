# StudyPal AI - Supabase Integration Setup Guide

## ✅ What's Already Done

Your StudyPal AI application now has **complete Supabase integration** with the following features:

### 🔧 Backend Setup
- ✅ Supabase client configured (`src/lib/supabase.ts`)
- ✅ Authentication utilities (`src/lib/auth.ts`)
- ✅ Environment variables configured (`.env.local`)
- ✅ TypeScript declarations (`src/declaration.d.ts`)
- ✅ Connection testing utility (`src/lib/test-supabase-connection.ts`)

### 🔐 Authentication Features
- ✅ **Email/Password Sign Up** with form validation
- ✅ **Email/Password Login** with error handling
- ✅ **Google OAuth** integration (buttons ready)
- ✅ **Facebook OAuth** integration (buttons ready)
- ✅ User profile creation in `profiles` table
- ✅ Password reset functionality
- ✅ Session management

### 📄 Updated Pages
- ✅ **Login.tsx**: Full Supabase integration with social login
- ✅ **SignUp.tsx**: Complete form integration with validation
- ✅ Error/success message displays
- ✅ Loading states and disabled buttons during requests

## 🗄️ Database Setup Required

You need to run the SQL script in your Supabase dashboard to create the necessary tables:

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/xphgwzbxwwaqoaedfsoq/sql
2. Open the SQL Editor

### Step 2: Run the Setup Script
Copy and paste the entire contents of `setup-supabase-tables.sql` and click **"Run"**

This script will create:
- ✅ `profiles` table for user data
- ✅ `chat_history` table for storing conversations
- ✅ `test_table` for connection testing
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation triggers
- ✅ Proper user permissions

## 🚀 Testing Your Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Check Console Logs
Open your browser's developer console. You should see:
```
🔗 Testing Supabase connection...
✅ Supabase client initialized
✅ Database connection successful
📊 Test data: [...]
👤 Current user: Not logged in
```

### 3. Test Sign Up
1. Navigate to `/signup`
2. Fill out the form
3. Click "Sign up"
4. Check your email for verification

### 4. Test Login  
1. Navigate to `/login`
2. Enter your credentials
3. Click "Log In"
4. Should redirect to `/chat`

## 🔑 OAuth Setup (Optional)

To enable Google/Facebook login:

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add to Supabase: Dashboard → Authentication → Providers → Google

### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a Facebook App
3. Add to Supabase: Dashboard → Authentication → Providers → Facebook

## 📁 File Structure

```
src/
├── lib/
│   ├── supabase.ts              # Supabase client
│   ├── auth.ts                  # Authentication utilities
│   ├── openai.ts                # OpenAI integration
│   └── test-supabase-connection.ts # Connection testing
├── pages/
│   ├── Login.tsx                # Login page with Supabase
│   ├── SignUp.tsx               # Sign up page with Supabase
│   └── Chat.tsx                 # Chat with OpenAI integration
├── contexts/
│   └── AuthContext.tsx          # Global auth state
├── hooks/
│   └── useAuth.ts               # Authentication hook
└── declaration.d.ts             # TypeScript environment types
```

## 🛠️ Available Functions

### Authentication (`src/lib/auth.ts`)
```typescript
// Sign up new user
await signUpUser({ email, password, firstName, lastName })

// Login existing user  
await loginUser({ email, password })

// Social logins
await loginWithGoogle()
await loginWithFacebook()

// User management
await getCurrentUser()
await getUserProfile(userId)
await updateUserProfile(userId, updates)
await logoutUser()
```

## 🔍 Troubleshooting

### Connection Issues
- Check `.env.local` has correct Supabase URL and keys
- Verify SQL script was run successfully
- Check browser console for detailed error messages

### Authentication Issues
- Confirm email verification is enabled in Supabase
- Check RLS policies are properly set
- Verify OAuth providers are configured if using social login

### Build Issues  
- Run `npm install` to ensure all dependencies
- Check TypeScript errors in terminal
- Verify environment variables are properly typed

## 🎉 You're Ready!

Your StudyPal AI app now has:
- ✅ Full user authentication system
- ✅ Secure database with proper permissions
- ✅ Real-time OpenAI chat integration
- ✅ Professional error handling
- ✅ Responsive UI with loading states

Just run the SQL script in Supabase and you're ready to accept user signups and logins!

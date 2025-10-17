const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection by trying to sign up a user
    console.log('Attempting to sign up admin user...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@restaurant.com',
      password: 'admin123',
      options: {
        data: {
          role: 'admin',
          name: 'Restaurant Admin'
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('Admin user already exists. Trying to sign in...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'admin@restaurant.com',
          password: 'admin123'
        });
        
        if (signInError) {
          console.error('Sign in error:', signInError.message);
          return;
        }
        
        console.log('Successfully signed in!');
        console.log('User ID:', signInData.user.id);
        console.log('Email:', signInData.user.email);
        console.log('User metadata:', signInData.user.user_metadata);
        
      } else {
        console.error('Sign up error:', signUpError.message);
        return;
      }
    } else {
      console.log('Admin user created successfully!');
      console.log('User ID:', signUpData.user?.id);
      console.log('Email:', signUpData.user?.email);
      console.log('Confirmation required:', !signUpData.user?.email_confirmed_at);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testAuth();
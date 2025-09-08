const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAndCreateAdmin() {
  try {
    console.log('Checking for existing admin users...');
    
    // List all users
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return;
    }
    
    console.log(`Found ${users.users.length} users in the system`);
    
    // Check if admin@restaurant.com exists
    const adminUser = users.users.find(user => user.email === 'admin@restaurant.com');
    
    if (adminUser) {
      console.log('Admin user already exists:', adminUser.email);
      console.log('User ID:', adminUser.id);
      console.log('Created at:', adminUser.created_at);
      return;
    }
    
    console.log('No admin user found. Creating admin user...');
    
    // Create admin user
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@restaurant.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Restaurant Admin'
      }
    });
    
    if (createError) {
      console.error('Error creating admin user:', createError);
      return;
    }
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@restaurant.com');
    console.log('Password: admin123');
    console.log('User ID:', newUser.user.id);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAndCreateAdmin();
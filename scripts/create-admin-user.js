const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  console.log('Creating admin user...')
  
  const email = 'admin@kulhadchai.shop'
  const password = 'KulhadChai@Admin2025'
  
  try {
    // Create user with admin role
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name: 'Admin User'
      }
    })
    
    if (error) {
      console.error('Error creating admin user:', error.message)
      return
    }
    
    console.log('✅ Admin user created successfully!')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('User ID:', data.user.id)
    console.log('\nYou can now login at: /admin/login')
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

createAdminUser()

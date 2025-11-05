const { createClient } = require('@supabase/supabase-js')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:')
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
  try {
    console.log('Creating admin user...')
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@kulhadchai.shop',
      password: 'KulhadChai@Admin2025',
      email_confirm: true,
      user_metadata: {
        name: 'Admin User',
        role: 'admin'
      }
    })
    
    if (error) {
      console.error('Error creating user:', error)
      return
    }
    
    console.log('✅ Admin user created successfully!')
    console.log('Email: admin@kulhadchai.shop')
    console.log('Password: KulhadChai@Admin2025')
    console.log('User ID:', data.user.id)
    console.log('\nYou can now login at: http://localhost:3000/admin/login')
    
  } catch (err) {
    console.error('Unexpected error:', err)
  }
}

createAdminUser()
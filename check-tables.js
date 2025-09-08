const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTables() {
  try {
    console.log('Fetching tables from database...')
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('number', { ascending: true })

    if (error) {
      console.error('Error fetching tables:', error)
      return
    }

    console.log('Tables found:', data.length)
    data.forEach(table => {
      console.log(`- Table ${table.number}: ID=${table.id}, Status=${table.status}, Capacity=${table.capacity}`)
    })
    
    if (data.length === 0) {
      console.log('\nNo tables found in database. Creating sample tables...')
      
      const sampleTables = [
        { number: 1, capacity: 4, status: 'available', qr_code: 'table-1-qr' },
        { number: 2, capacity: 2, status: 'available', qr_code: 'table-2-qr' },
        { number: 3, capacity: 6, status: 'available', qr_code: 'table-3-qr' },
        { number: 4, capacity: 4, status: 'available', qr_code: 'table-4-qr' },
        { number: 5, capacity: 8, status: 'available', qr_code: 'table-5-qr' }
      ]
      
      const { data: insertedTables, error: insertError } = await supabase
        .from('tables')
        .insert(sampleTables)
        .select()
      
      if (insertError) {
        console.error('Error creating tables:', insertError)
      } else {
        console.log('Sample tables created:')
        insertedTables.forEach(table => {
          console.log(`- Table ${table.number}: ID=${table.id}`)
        })
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkTables()
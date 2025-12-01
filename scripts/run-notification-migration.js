/**
 * Script to run the notification system database migration
 * 
 * This script helps you apply the notification schema migration to your Supabase database.
 * 
 * Usage:
 * 1. Make sure you have Supabase CLI installed: npm install -g supabase
 * 2. Make sure you're logged in: supabase login
 * 3. Link your project: supabase link --project-ref your-project-ref
 * 4. Run this script: node scripts/run-notification-migration.js
 * 
 * OR manually apply via Supabase Dashboard:
 * 1. Go to your Supabase project dashboard
 * 2. Navigate to SQL Editor
 * 3. Copy the contents of supabase/migrations/004_notifications_schema.sql
 * 4. Paste and run the SQL
 */

const fs = require('fs');
const path = require('path');

const migrationFile = path.join(__dirname, '../supabase/migrations/004_notifications_schema.sql');

console.log('📋 Notification System Migration Helper\n');
console.log('==========================================\n');

if (!fs.existsSync(migrationFile)) {
  console.error('❌ Migration file not found:', migrationFile);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

console.log('✅ Migration file found!\n');
console.log('To apply this migration, you have two options:\n');

console.log('Option 1: Via Supabase Dashboard (Recommended for first-time setup)');
console.log('─────────────────────────────────────────────────────────────────────');
console.log('1. Go to your Supabase project dashboard: https://supabase.com/dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Click "New Query"');
console.log('4. Copy and paste the SQL from: supabase/migrations/004_notifications_schema.sql');
console.log('5. Click "Run" to execute the migration\n');

console.log('Option 2: Via Supabase CLI');
console.log('─────────────────────────────────────────────────────────────────────');
console.log('1. Install Supabase CLI: npm install -g supabase');
console.log('2. Login: supabase login');
console.log('3. Link your project: supabase link --project-ref your-project-ref');
console.log('4. Run migration: supabase migration up\n');

console.log('Migration file location:');
console.log(migrationFile);
console.log('\n');

// Check if Supabase CLI is available
const { execSync } = require('child_process');
try {
  execSync('supabase --version', { stdio: 'ignore' });
  console.log('✅ Supabase CLI is installed');
  console.log('You can run: supabase migration up\n');
} catch (error) {
  console.log('ℹ️  Supabase CLI not found. Install it with: npm install -g supabase\n');
}

console.log('📝 Migration Summary:');
console.log('─────────────────────────────────────────────────────────────────────');
console.log('This migration will create:');
console.log('  • notifications table - Stores all notification records');
console.log('  • notification_preferences table - User notification preferences');
console.log('  • push_subscriptions table - Web Push subscription data');
console.log('  • Indexes for performance');
console.log('  • RLS policies for security');
console.log('  • Triggers for updated_at timestamps\n');


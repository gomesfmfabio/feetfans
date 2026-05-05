#!/usr/bin/env node

/**
 * Temporary script to apply age verification migration to Supabase
 * This adds age_verified and account_blocked columns to users table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kyuojnabfherpqmgrmol.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Applying age verification migration...');

  try {
    // Add age_verified column
    const { error: error1 } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false'
    });

    if (error1 && !error1.message.includes('already exists')) {
      console.error('Error adding age_verified column:', error1);
    } else {
      console.log('✓ age_verified column added');
    }

    // Add account_blocked column
    const { error: error2 } = await supabase.rpc('exec', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS account_blocked BOOLEAN DEFAULT false'
    });

    if (error2 && !error2.message.includes('already exists')) {
      console.error('Error adding account_blocked column:', error2);
    } else {
      console.log('✓ account_blocked column added');
    }

    console.log('\nMigration completed successfully!');
    console.log('\nNote: Storage bucket "id-documents" was created via API.');
    console.log('RLS policies for storage bucket must be applied manually via Supabase Dashboard.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

applyMigration();

#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('Applying age verification migration...\n');

  try {
    // Check if columns already exist by attempting to select them
    const { data, error: checkError } = await supabase
      .from('users')
      .select('age_verified, account_blocked')
      .limit(1);

    if (!checkError) {
      console.log('✓ Columns already exist in users table');
      console.log('Migration already applied!\n');
      return;
    }

    // If columns don't exist, we need to add them via SQL
    // Since Supabase client doesn't support DDL, we'll use fetch with SQL endpoint
    console.log('Adding age_verified and account_blocked columns...');

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`
      },
      body: JSON.stringify({
        query: `
          ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false;
          ALTER TABLE users ADD COLUMN IF NOT EXISTS account_blocked BOOLEAN DEFAULT false;
        `
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log('Note: SQL execution via API not available.');
      console.log('Please run the following SQL manually in Supabase Dashboard:\n');
      console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false;');
      console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS account_blocked BOOLEAN DEFAULT false;\n');
      return;
    }

    console.log('✓ Columns added successfully\n');
  } catch (err) {
    console.error('Migration error:', err);
    console.log('\nPlease run the following SQL manually in Supabase Dashboard:\n');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false;');
    console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS account_blocked BOOLEAN DEFAULT false;\n');
  }
}

runMigration();

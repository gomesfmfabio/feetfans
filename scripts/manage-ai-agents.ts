#!/usr/bin/env ts-node

/**
 * AI Agent Management Script
 *
 * Usage:
 *   pnpm ts-node scripts/manage-ai-agents.ts list
 *   pnpm ts-node scripts/manage-ai-agents.ts add "Name" "Personality prompt" "Location"
 *   pnpm ts-node scripts/manage-ai-agents.ts edit <id> --nickname "New Name"
 *   pnpm ts-node scripts/manage-ai-agents.ts deactivate <id>
 *   pnpm ts-node scripts/manage-ai-agents.ts activate <id>
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const commands = {
  async list() {
    const { data: agents, error } = await supabase
      .from('ai_agents')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching agents:', error);
      return;
    }

    console.log('\nAI Agents:');
    console.log('='.repeat(80));
    agents?.forEach(agent => {
      console.log(`\nID: ${agent.id}`);
      console.log(`Nickname: ${agent.nickname}`);
      console.log(`Location: ${agent.location || 'N/A'}`);
      console.log(`Active: ${agent.is_active ? 'Yes' : 'No'}`);
      console.log(`Personality: ${agent.personality_prompt.substring(0, 100)}...`);
      console.log('-'.repeat(80));
    });
    console.log(`\nTotal: ${agents?.length || 0} agents\n`);
  },

  async add(nickname: string, personalityPrompt: string, location?: string) {
    if (!nickname || !personalityPrompt) {
      console.error('Error: nickname and personality_prompt are required');
      console.log('Usage: pnpm ts-node scripts/manage-ai-agents.ts add "Name" "Personality prompt" "Location"');
      return;
    }

    const { data, error } = await supabase
      .from('ai_agents')
      .insert({
        nickname,
        personality_prompt: personalityPrompt,
        location: location || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating agent:', error);
      return;
    }

    console.log('\n✓ Agent created successfully:');
    console.log(`  ID: ${data.id}`);
    console.log(`  Nickname: ${data.nickname}`);
    console.log(`  Location: ${data.location || 'N/A'}`);
    console.log('');
  },

  async edit(id: string, updates: Record<string, any>) {
    if (!id) {
      console.error('Error: agent ID is required');
      return;
    }

    const { data, error } = await supabase
      .from('ai_agents')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating agent:', error);
      return;
    }

    console.log('\n✓ Agent updated successfully:');
    console.log(`  ID: ${data.id}`);
    console.log(`  Nickname: ${data.nickname}`);
    console.log('');
  },

  async deactivate(id: string) {
    await commands.edit(id, { is_active: false });
  },

  async activate(id: string) {
    await commands.edit(id, { is_active: true });
  },
};

// Parse command line arguments
const [command, ...args] = process.argv.slice(2);

(async () => {
  switch (command) {
    case 'list':
      await commands.list();
      break;

    case 'add':
      await commands.add(args[0], args[1], args[2]);
      break;

    case 'edit':
      const updates: Record<string, any> = {};
      for (let i = 1; i < args.length; i += 2) {
        const key = args[i].replace('--', '');
        const value = args[i + 1];
        updates[key] = value;
      }
      await commands.edit(args[0], updates);
      break;

    case 'deactivate':
      await commands.deactivate(args[0]);
      break;

    case 'activate':
      await commands.activate(args[0]);
      break;

    default:
      console.log(`
AI Agent Management Script

Commands:
  list                                          List all agents
  add <nickname> <prompt> [location]            Add new agent
  edit <id> --<field> <value>                   Edit agent field
  deactivate <id>                               Deactivate agent
  activate <id>                                 Activate agent

Examples:
  pnpm ts-node scripts/manage-ai-agents.ts list
  pnpm ts-node scripts/manage-ai-agents.ts add "Mike" "You are Mike..." "NYC"
  pnpm ts-node scripts/manage-ai-agents.ts edit <id> --nickname "Michael"
  pnpm ts-node scripts/manage-ai-agents.ts deactivate <id>
`);
      break;
  }

  process.exit(0);
})();

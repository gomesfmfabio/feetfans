import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateAgentMessage } from '../../../../../../lib/ai-agents/message-generator';

// Cron job endpoint to process due AI agent assignments
// Run hourly to check for assignments where scheduled_for <= NOW()
// Creates conversations, generates AI messages, and marks assignments as sent

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes timeout

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase credentials' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the database function to process due assignments
    // This creates conversations and marks assignments as sent
    const { data, error } = await supabase.rpc('process_due_agent_assignments');

    if (error) {
      console.error('Error processing assignments:', error);
      return NextResponse.json(
        { error: 'Failed to process assignments', details: error.message },
        { status: 500 }
      );
    }

    // Process results and generate AI messages
    const results = data || [];
    const messageResults = [];

    for (const assignment of results) {
      if (assignment.status === 'conversation_created') {
        try {
          // Get conversation_id from the assignment
          const { data: assignmentData } = await supabase
            .from('agent_assignments')
            .select('conversation_id')
            .eq('id', assignment.assignment_id)
            .single();

          if (!assignmentData?.conversation_id) {
            messageResults.push({
              assignment_id: assignment.assignment_id,
              status: 'error: conversation_id not found',
            });
            continue;
          }

          // Generate AI message
          await generateAgentMessage(
            assignment.agent_id,
            assignment.creator_id,
            assignmentData.conversation_id
          );

          messageResults.push({
            assignment_id: assignment.assignment_id,
            status: 'message_sent',
          });
        } catch (err: any) {
          console.error(
            `Failed to generate message for assignment ${assignment.assignment_id}:`,
            err.message
          );
          messageResults.push({
            assignment_id: assignment.assignment_id,
            status: `error: ${err.message}`,
          });
        }
      } else {
        // Assignment failed during conversation creation
        messageResults.push({
          assignment_id: assignment.assignment_id,
          status: assignment.status,
        });
      }
    }

    // Count successes and errors
    const successful = messageResults.filter((r: any) => r.status === 'message_sent').length;
    const failed = messageResults.filter((r: any) => r.status.startsWith('error')).length;

    console.log(
      `Processed ${results.length} assignments: ${successful} messages sent, ${failed} failed`
    );

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful,
      failed,
      results: messageResults,
    });
  } catch (err: any) {
    console.error('Cron job error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

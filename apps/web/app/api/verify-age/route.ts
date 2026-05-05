import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const body = await request.json();
    const { filePath, userId } = body;

    if (!filePath || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user owns the uploaded file
    if (user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // ============================================
    // MVP MOCK VERIFICATION
    // ============================================
    // In production, this would integrate with Onfido/Persona/Vouched API:
    //
    // 1. Create applicant in verification service
    // 2. Submit document for verification
    // 3. Return verification ID for tracking
    // 4. Webhook receives result and updates users.age_verified
    //
    // For now, we auto-approve for development purposes.
    // TODO: Replace with real age verification provider integration
    // ============================================

    console.log(`Age verification requested for user ${userId}, file: ${filePath}`);

    // Log verification attempt for audit trail (optional for MVP)
    try {
      await supabaseAdmin
        .from('age_verification_log')
        .insert({
          user_id: userId,
          file_path: filePath,
          status: 'pending',
          created_at: new Date().toISOString()
        });
    } catch {
      // Table doesn't exist yet - this is optional for MVP
      console.log('age_verification_log table not found, skipping audit log');
    }

    // Mock verification response
    return NextResponse.json({
      success: true,
      message: 'Verification in progress',
      // In production, return verification ID for tracking:
      // verificationId: 'mock-verification-id'
    });
  } catch (err) {
    console.error('Verification error:', err);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

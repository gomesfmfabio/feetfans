import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Verify FeetFans course graduate and grant free access
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { course_id } = body;

    // Get authenticated user
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c) => {
        const [key, ...v] = c.split('=');
        return [key, v.join('=')];
      })
    );

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabase = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: {
            getItem: (key) => cookies[key] || null,
            setItem: () => {},
            removeItem: () => {},
          },
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!course_id) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Use service role client for verification
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Call verification function
    const { data, error } = await supabaseAdmin.rpc('verify_course_access', {
      p_email: session.user.email!,
      p_course_id: course_id,
    });

    if (error) {
      console.error('Verification error:', error);
      return NextResponse.json(
        { error: 'Verification failed', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error: 'Invalid course ID',
          message:
            'Email not found in course graduates. Contact support if you completed the FeetFans course.',
        },
        { status: 400 }
      );
    }

    console.log(
      `[Course Access] Granted free access to ${session.user.email} with course ${course_id}`
    );

    return NextResponse.json({
      success: true,
      message:
        'Access granted! Welcome to FeetFans Pro (Course Graduate Edition)',
    });
  } catch (err: any) {
    console.error('[Course Access] Error:', err);
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { securityMonitor, SecurityEventType, SecuritySeverity } from '@/lib/security/monitoring';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin or requesting their own events
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    const isAdmin = profile?.role === 'admin';
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SecurityEventType;
    const severity = searchParams.get('severity') as SecuritySeverity;
    const userId = searchParams.get('userId');
    const ipAddress = searchParams.get('ipAddress');
    const limit = parseInt(searchParams.get('limit') || '50');
    const timeframe = searchParams.get('timeframe') as '24h' | '7d' | '30d';
    
    // Calculate date range based on timeframe
    let startDate: string | undefined;
    if (timeframe) {
      const now = new Date();
      switch (timeframe) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
      }
    }
    
    // Build filters
    const filters: any = { limit };
    if (type) filters.type = type;
    if (severity) filters.severity = severity;
    if (ipAddress) filters.ipAddress = ipAddress;
    if (startDate) filters.startDate = startDate;
    
    // If not admin, only allow viewing own events
    if (!isAdmin) {
      filters.userId = user.id;
    } else if (userId) {
      filters.userId = userId;
    }
    
    // Get security events
    const events = await securityMonitor.getEvents(filters);
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching security events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { type, severity, details, userId } = body;
    
    if (!type || !severity || !details) {
      return NextResponse.json(
        { error: 'Missing required fields: type, severity, details' },
        { status: 400 }
      );
    }
    
    // Log the security event
    const event = await securityMonitor.logEvent(
      type,
      severity,
      details,
      request,
      userId
    );
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating security event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
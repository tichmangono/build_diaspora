import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const cfConnectingIp = request.headers.get('cf-connecting-ip')
    
    let ip = 'unknown'
    
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      ip = forwarded.split(',')[0].trim()
    } else if (realIp) {
      ip = realIp
    } else if (cfConnectingIp) {
      ip = cfConnectingIp
    } else {
      // Fallback to connection remote address
      const remoteAddress = request.headers.get('x-vercel-forwarded-for') || 
                           request.headers.get('x-forwarded-for') ||
                           'unknown'
      ip = remoteAddress
    }

    // Validate IP format (basic IPv4/IPv6 check)
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    
    if (!ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
      // If IP doesn't match expected format, mask it for privacy
      ip = ip.length > 0 ? `${ip.substring(0, 3)}***` : 'unknown'
    }

    return NextResponse.json({
      success: true,
      ip: ip,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Client IP fetch error:', error)
    return NextResponse.json(
      { 
        success: false,
        ip: 'unknown',
        error: 'Failed to determine client IP'
      },
      { status: 500 }
    )
  }
} 
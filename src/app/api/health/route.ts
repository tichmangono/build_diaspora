import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Basic system checks
    const checks = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: 'unknown', responseTime: 0 },
        memory: { status: 'unknown', usage: 0, percentage: 0 },
        uptime: process.uptime(),
      }
    };

    // Database connectivity check
    try {
      const supabase = createClient();
      const dbStartTime = Date.now();
      
      // Simple query to check database connectivity
      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .single();
      
      const dbResponseTime = Date.now() - dbStartTime;
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        checks.checks.database = {
          status: 'unhealthy',
          responseTime: dbResponseTime,
          error: error.message
        };
        checks.status = 'degraded';
      } else {
        checks.checks.database = {
          status: 'healthy',
          responseTime: dbResponseTime
        };
      }
    } catch (error) {
      checks.checks.database = {
        status: 'unhealthy',
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Unknown database error'
      };
      checks.status = 'unhealthy';
    }

    // Memory usage check
    try {
      const memUsage = process.memoryUsage();
      const totalMemory = memUsage.heapTotal;
      const usedMemory = memUsage.heapUsed;
      const memoryPercentage = (usedMemory / totalMemory) * 100;
      
      checks.checks.memory = {
        status: memoryPercentage > 90 ? 'warning' : 'healthy',
        usage: Math.round(usedMemory / 1024 / 1024), // MB
        percentage: Math.round(memoryPercentage)
      };
      
      if (memoryPercentage > 95) {
        checks.status = 'degraded';
      }
    } catch (error) {
      checks.checks.memory = {
        status: 'error',
        usage: 0,
        percentage: 0,
        error: error instanceof Error ? error.message : 'Memory check failed'
      };
    }

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;
    
    // Determine overall status
    const isHealthy = checks.checks.database.status === 'healthy' && 
                     checks.checks.memory.status !== 'error';
    
    const statusCode = isHealthy ? 200 : 503;
    
    return NextResponse.json({
      ...checks,
      responseTime: totalResponseTime
    }, { status: statusCode });

  } catch (error) {
    // Critical error - return unhealthy status
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Health check failed',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 503 });
  }
} 
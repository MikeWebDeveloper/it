import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Enhanced health check for Vercel deployment
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      deployment: {
        vercel_env: process.env.VERCEL_ENV,
        vercel_region: process.env.VERCEL_REGION,
        vercel_deployment_id: process.env.VERCEL_DEPLOYMENT_ID,
        vercel_url: process.env.VERCEL_URL,
        function_name: process.env.AWS_LAMBDA_FUNCTION_NAME,
        function_version: process.env.AWS_LAMBDA_FUNCTION_VERSION,
      },
      services: {
        next_js: 'healthy',
        static_files: 'healthy',
        api_routes: 'healthy',
        data_loading: 'healthy'
      },
      performance: {
        memory_usage: {
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
        },
        cpu_usage: {
          user: cpuUsage.user,
          system: cpuUsage.system
        },
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    return NextResponse.json(healthCheck, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Health-Check': 'vercel-optimized'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}
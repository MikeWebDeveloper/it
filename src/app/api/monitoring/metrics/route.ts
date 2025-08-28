import { NextRequest, NextResponse } from 'next/server';

// GET endpoint for Vercel deployment metrics
export async function GET() {
  try {
    const deploymentMetrics = {
      timestamp: new Date().toISOString(),
      deployment: {
        id: process.env.VERCEL_DEPLOYMENT_ID,
        url: process.env.VERCEL_URL,
        region: process.env.VERCEL_REGION,
        env: process.env.VERCEL_ENV,
        branch_url: process.env.VERCEL_BRANCH_URL,
      },
      runtime: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch,
        uptime: process.uptime(),
      },
      memory: {
        ...process.memoryUsage(),
        formatted: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        }
      },
      cpu: process.cpuUsage(),
    };

    return NextResponse.json(deploymentMetrics);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get deployment metrics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { metrics } = await request.json();

    // Enhanced logging with Vercel context
    console.log('Performance metrics received:', {
      ...metrics,
      deployment_id: process.env.VERCEL_DEPLOYMENT_ID,
      region: process.env.VERCEL_REGION,
      timestamp: new Date().toISOString()
    });

    // In production, forward to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to monitoring service
      await Promise.all(metrics.map(async (metric: { name: string; value: number; unit: string; route?: string; timestamp: string }) => {
        // Send to external analytics service
        // await sendToAnalytics(metric);
        
        // Store in time-series database
        // await storeMetricInDB(metric);
        
        console.log('Production metric:', {
          name: metric.name,
          value: metric.value,
          unit: metric.unit,
          route: metric.route,
          timestamp: metric.timestamp
        });

        // Alert on performance threshold breaches
        await checkPerformanceThresholds(metric);
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing metrics:', error);
    return NextResponse.json(
      { error: 'Failed to process metrics' },
      { status: 500 }
    );
  }
}

async function checkPerformanceThresholds(metric: { name: string; value: number; unit: string; route?: string; timestamp: string }) {
  const thresholds = {
    LCP: 2500,  // Large Contentful Paint - 2.5s
    FID: 100,   // First Input Delay - 100ms  
    CLS: 0.1,   // Cumulative Layout Shift - 0.1
    TTFB: 600   // Time to First Byte - 600ms
  };

  const threshold = thresholds[metric.name as keyof typeof thresholds];
  if (threshold && metric.value > threshold) {
    console.warn(`Performance threshold breach: ${metric.name} = ${metric.value}${metric.unit} (threshold: ${threshold})`);
    
    // In production, send alert to monitoring system
    // await sendAlert({
    //   type: 'performance_threshold_breach',
    //   metric: metric.name,
    //   value: metric.value,
    //   threshold,
    //   route: metric.route
    // });
  }
}
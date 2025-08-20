import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { metrics } = await request.json();

    // Log metrics server-side
    console.log('Performance metrics received:', metrics);

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
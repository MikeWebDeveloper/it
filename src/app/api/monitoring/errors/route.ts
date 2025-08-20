import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { errors } = await request.json();

    // Log errors server-side
    console.error('Client errors received:', errors);

    // In production, forward to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, or custom monitoring service
      await Promise.all(errors.map(async (errorData: { error: { message: string; stack?: string }; context: Record<string, unknown> }) => {
        // Send to external service
        // await sendToSentry(errorData);
        // await sendToLogRocket(errorData);
        
        // Store in database for analysis
        // await storeErrorInDB(errorData);
        
        console.error('Production error:', {
          message: errorData.error.message,
          stack: errorData.error.stack,
          context: errorData.context
        });
      }));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing error reports:', error);
    return NextResponse.json(
      { error: 'Failed to process error reports' },
      { status: 500 }
    );
  }
}
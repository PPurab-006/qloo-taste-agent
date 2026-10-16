import { NextResponse } from 'next/server';
import { qlooClient } from '@/lib/qloo/client';

export async function GET() {
  try {
    const health = await qlooClient.checkHealth();
    return NextResponse.json({
      status: 'healthy',
      app: 'Vellum Cultural Intelligence Engine',
      version: '0.1.0',
      qloo: {
        reachable: health.reachable,
        mode: health.mode,
        baseUrl: health.baseUrl,
        latencyMs: health.latencyMs,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'degraded',
        error: err instanceof Error ? err.message : 'Health probe failed',
        qloo: {
          reachable: false,
          mode: 'mock',
          baseUrl: qlooClient.getBaseUrl(),
        },
      },
      { status: 200 } // degraded health still returns 200 to allow graceful UI handling
    );
  }
}

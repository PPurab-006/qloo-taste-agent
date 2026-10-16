import { NextRequest, NextResponse } from 'next/server';
import { qlooClient, QlooApiError } from '@/lib/qloo/client';
import { QlooEntityType } from '@/types/qloo';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filterType = searchParams.get('filterType') as QlooEntityType | null;
    const signalEntitiesRaw = searchParams.get('signalEntities');
    const take = searchParams.get('take') ? Number(searchParams.get('take')) : 10;
    const locationQuery = searchParams.get('location') || undefined;

    if (!filterType) {
      return NextResponse.json(
        { error: 'Query parameter "filterType" is required (e.g. urn:entity:movie)' },
        { status: 400 }
      );
    }

    if (!signalEntitiesRaw) {
      return NextResponse.json(
        { error: 'Query parameter "signalEntities" is required as comma-separated UUIDs' },
        { status: 400 }
      );
    }

    const signalEntities = signalEntitiesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (signalEntities.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid entity UUID must be provided in signalEntities' },
        { status: 400 }
      );
    }

    const { response, isMock } = await qlooClient.getInsights({
      filterType,
      signalEntities,
      take,
      signalLocationQuery: locationQuery,
      sortBy: 'affinity',
    });

    return NextResponse.json({
      success: true,
      filterType,
      signalEntities,
      isMock,
      results: response.results,
      query: response.query,
    });
  } catch (err) {
    if (err instanceof QlooApiError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
          upstream: err.upstreamMessage,
        },
        { status: err.status }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to retrieve insights from Qloo API',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

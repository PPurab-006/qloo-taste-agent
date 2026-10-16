import { NextRequest, NextResponse } from 'next/server';
import { qlooClient, QlooApiError } from '@/lib/qloo/client';
import { QlooEntityType } from '@/types/qloo';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') as QlooEntityType | null;
    const take = searchParams.get('take') ? Number(searchParams.get('take')) : 10;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "query" is required' },
        { status: 400 }
      );
    }

    const { entities, isMock } = await qlooClient.search({
      query: query.trim(),
      types: type ? [type] : undefined,
      take,
    });

    return NextResponse.json({
      success: true,
      query,
      type: type || 'all',
      count: entities.length,
      isMock,
      entities,
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
        error: 'An unexpected error occurred while querying Qloo Search API',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

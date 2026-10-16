import { NextRequest, NextResponse } from 'next/server';
import { experienceCurator } from '@/lib/synthesis/curator';
import { TasteProfileInputSchema } from '@/lib/qloo/schemas';
import { QlooApiError } from '@/lib/qloo/client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = TasteProfileInputSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed for taste profile',
          issues: validation.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const profile = validation.data;
    const experience = await experienceCurator.curateExperience(profile);

    return NextResponse.json({
      success: true,
      experience,
    });
  } catch (err) {
    if (err instanceof QlooApiError) {
      return NextResponse.json(
        {
          error: err.message,
          code: err.code,
        },
        { status: err.status }
      );
    }

    return NextResponse.json(
      {
        error: 'An error occurred during cultural experience curation',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

import { getTopEntries, submitScore, type SubmitScorePayload } from '~/lib/leaderboard';

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 10;
  const entries = await getTopEntries(Number.isFinite(limit) ? limit : 10);
  return NextResponse.json({ entries }, { status: 200 });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as SubmitScorePayload;

  if (!payload?.fid || payload.score === undefined || payload.opponentScore === undefined) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const result = await submitScore(payload);
  return NextResponse.json({ success: true, bestScore: result.bestScore });
}

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { fetchLocationDetails } from '@/lib/weather-service';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get('lat') || '17.3850');
  const lng = parseFloat(searchParams.get('lng') || '78.4867');

  const details = await fetchLocationDetails(lat, lng);
  return NextResponse.json(details);
}

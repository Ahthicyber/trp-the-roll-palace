import { NextResponse } from 'next/server';
import { getDeliveryZones } from '@/lib/db';

export async function GET() {
  try {
    const zones = getDeliveryZones(true);
    return NextResponse.json({ zones });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


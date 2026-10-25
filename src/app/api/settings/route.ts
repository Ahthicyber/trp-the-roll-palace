import { NextResponse } from 'next/server';
import { getRestaurantSettings } from '@/lib/db';

export async function GET() {
  try {
    const settings = getRestaurantSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


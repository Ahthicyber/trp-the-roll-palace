import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getRestaurantSettings, updateRestaurantSettings, createAuditLog } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = getRestaurantSettings();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    updateRestaurantSettings(body);

    createAuditLog(
      session.userId,
      session.email,
      'UPDATE_SETTINGS',
      'Updated restaurant settings'
    );

    const updated = getRestaurantSettings();
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getCategories, createCategory, createAuditLog } from '@/lib/db';

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = getCategories(false);
    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = createCategory({
      name: body.name,
      slug,
      description: body.description || '',
      image_url: body.image_url || '',
      display_order: body.display_order ? parseInt(body.display_order) : 0,
      is_active: body.is_active !== false,
    });

    createAuditLog(
      session.userId,
      session.email,
      'CREATE_CATEGORY',
      `Created category: ${category.name}`
    );

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


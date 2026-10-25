import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getProducts, createProduct, createAuditLog } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || undefined;
    const search = searchParams.get('search') || undefined;

    const products = getProducts({
      categoryId,
      search,
      onlyAvailable: false,
    });

    return NextResponse.json({ products });
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
    if (!body.name || !body.price || !body.category_id) {
      return NextResponse.json(
        { error: 'Product name, category, and price are required.' },
        { status: 400 }
      );
    }

    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

    const product = createProduct({
      category_id: body.category_id,
      name: body.name,
      slug,
      description: body.description || '',
      price: parseFloat(body.price),
      image_url: body.image_url || '',
      is_available: body.is_available !== false,
      is_featured: Boolean(body.is_featured),
      discount_percent: body.discount_percent ? parseFloat(body.discount_percent) : 0,
      display_order: body.display_order ? parseInt(body.display_order) : 0,
    });

    createAuditLog(
      session.userId,
      session.email,
      'CREATE_PRODUCT',
      `Created product: ${product.name} (Rs. ${product.price})`
    );

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getProductById, updateProduct, deleteProduct, createAuditLog } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const product = getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const cleanUpdates: any = { ...body };
    if (body.price !== undefined) cleanUpdates.price = parseFloat(body.price);
    if (body.discount_percent !== undefined) cleanUpdates.discount_percent = parseFloat(body.discount_percent);
    if (body.display_order !== undefined) cleanUpdates.display_order = parseInt(body.display_order);

    const updated = updateProduct(id, cleanUpdates);

    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    createAuditLog(
      session.userId,
      session.email,
      'UPDATE_PRODUCT',
      `Updated product: ${updated.name} (Rs. ${updated.price})`
    );

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = getProductById(id);
    const success = deleteProduct(id);

    if (!success) {
      return NextResponse.json({ error: 'Product not found or could not be deleted' }, { status: 404 });
    }

    createAuditLog(
      session.userId,
      session.email,
      'DELETE_PRODUCT',
      `Deleted product: ${existing?.name || id}`
    );

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

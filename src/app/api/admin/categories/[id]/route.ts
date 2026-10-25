import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { getCategoryById, updateCategory, deleteCategory, createAuditLog } from '@/lib/db';

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
    const category = getCategoryById(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ category });
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

    const updated = updateCategory(id, {
      ...body,
      display_order: body.display_order !== undefined ? parseInt(body.display_order) : undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    createAuditLog(
      session.userId,
      session.email,
      'UPDATE_CATEGORY',
      `Updated category: ${updated.name}`
    );

    return NextResponse.json({ success: true, category: updated });
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
    const existing = getCategoryById(id);
    const success = deleteCategory(id);

    if (!success) {
      return NextResponse.json({ error: 'Category not found or could not be deleted' }, { status: 404 });
    }

    createAuditLog(
      session.userId,
      session.email,
      'DELETE_CATEGORY',
      `Deleted category: ${existing?.name || id}`
    );

    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


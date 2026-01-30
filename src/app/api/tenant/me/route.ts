import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: session.user.tenantId },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Convert to snake_case for frontend compatibility
    return NextResponse.json({
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      logo_url: tenant.logoUrl,
      primary_color: tenant.primaryColor,
      category: tenant.category,
      category_data: tenant.categoryData,
      created_at: tenant.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, primary_color, category_data } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (primary_color !== undefined) updateData.primaryColor = primary_color;
    if (category_data !== undefined) updateData.categoryData = category_data;

    const tenant = await prisma.tenant.update({
      where: { id: session.user.tenantId },
      data: updateData,
    });

    // Convert to snake_case for frontend compatibility
    return NextResponse.json({
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      email: tenant.email,
      phone: tenant.phone,
      logo_url: tenant.logoUrl,
      primary_color: tenant.primaryColor,
      category: tenant.category,
      category_data: tenant.categoryData,
      created_at: tenant.createdAt.toISOString(),
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

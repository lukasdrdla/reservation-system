import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant nenalezen' },
        { status: 404 }
      );
    }

    // Konverze pro kompatibilitu s frontendem
    const response = {
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
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Tenant fetch error:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání tenanta' },
      { status: 500 }
    );
  }
}

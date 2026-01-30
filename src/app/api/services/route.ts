import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tenantId = searchParams.get('tenant_id');

  if (!tenantId) {
    return NextResponse.json(
      { error: 'tenant_id je povinný' },
      { status: 400 }
    );
  }

  try {
    const services = await prisma.service.findMany({
      where: {
        tenantId,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error('Services fetch error:', error);
    return NextResponse.json(
      { error: 'Chyba při načítání služeb' },
      { status: 500 }
    );
  }
}

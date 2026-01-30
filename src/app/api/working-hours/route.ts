import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tenantId = searchParams.get('tenant_id');

    if (!tenantId) {
      return NextResponse.json({ error: 'tenant_id is required' }, { status: 400 });
    }

    const workingHours = await prisma.workingHours.findMany({
      where: { tenantId },
      orderBy: { dayOfWeek: 'asc' },
    });

    return NextResponse.json(
      workingHours.map((wh) => ({
        id: wh.id,
        tenant_id: wh.tenantId,
        day_of_week: wh.dayOfWeek,
        start_time: wh.startTime,
        end_time: wh.endTime,
        is_working: wh.isWorking,
      }))
    );
  } catch (error) {
    console.error('Error fetching working hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tenant_id, day_of_week, start_time, end_time, is_working } = body;

    // Verify tenant ownership
    if (tenant_id !== session.user.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const workingHours = await prisma.workingHours.create({
      data: {
        tenantId: tenant_id,
        dayOfWeek: day_of_week,
        startTime: start_time,
        endTime: end_time,
        isWorking: is_working,
      },
    });

    return NextResponse.json({
      id: workingHours.id,
      tenant_id: workingHours.tenantId,
      day_of_week: workingHours.dayOfWeek,
      start_time: workingHours.startTime,
      end_time: workingHours.endTime,
      is_working: workingHours.isWorking,
    });
  } catch (error) {
    console.error('Error creating working hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

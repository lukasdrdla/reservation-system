import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.tenantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    // Verify working hours belongs to this tenant
    const workingHours = await prisma.workingHours.findUnique({
      where: { id },
    });

    if (!workingHours || workingHours.tenantId !== session.user.tenantId) {
      return NextResponse.json({ error: 'Working hours not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (body.start_time !== undefined) updateData.startTime = body.start_time;
    if (body.end_time !== undefined) updateData.endTime = body.end_time;
    if (body.is_working !== undefined) updateData.isWorking = body.is_working;

    const updated = await prisma.workingHours.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      tenant_id: updated.tenantId,
      day_of_week: updated.dayOfWeek,
      start_time: updated.startTime,
      end_time: updated.endTime,
      is_working: updated.isWorking,
    });
  } catch (error) {
    console.error('Error updating working hours:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

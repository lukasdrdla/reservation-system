import { createClient } from '@/lib/supabase/server';
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

  const supabase = await createClient();

  const { data: services, error } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('active', true)
    .order('name');

  if (error) {
    return NextResponse.json(
      { error: 'Chyba při načítání služeb' },
      { status: 500 }
    );
  }

  return NextResponse.json(services || []);
}

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !tenant) {
    return NextResponse.json(
      { error: 'Tenant nenalezen' },
      { status: 404 }
    );
  }

  return NextResponse.json(tenant);
}

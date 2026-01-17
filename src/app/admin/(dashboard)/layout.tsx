import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/admin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  // Načíst tenant info pro aktuálního uživatele
  // Pro MVP předpokládáme, že email uživatele odpovídá emailu tenanta
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('email', user.email)
    .single();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar tenantName={tenant?.name} />
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}

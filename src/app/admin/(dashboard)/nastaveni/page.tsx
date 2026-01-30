'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Input } from '@/components/ui';
import type { Tenant, Service, WorkingHours, RestaurantData, WellnessData, BarbershopData, FitnessData } from '@/lib/types';
import { Loader2, Plus, Trash2, Save, Building, Clock, Briefcase, Grid3x3 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { getCategoryLabel } from '@/lib/categories';
import {
  RestaurantSettings,
  WellnessSettings,
  BarbershopSettings,
  FitnessSettings,
} from '@/components/admin/settings';

const DAY_NAMES = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'services' | 'hours' | 'category'>('profile');

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    primary_color: '#0066FF',
  });

  const [newService, setNewService] = useState({
    name: '',
    duration: 60,
    price: 0,
    description: '',
  });

  const loadData = async () => {
    if (status === 'loading') return;

    if (status === 'unauthenticated' || !session?.user?.tenantId) {
      router.push('/admin/login');
      return;
    }

    try {
      // Fetch tenant data
      const tenantRes = await fetch('/api/tenant/me');
      if (!tenantRes.ok) {
        setLoading(false);
        return;
      }
      const tenantData = await tenantRes.json();

      setTenant(tenantData);
      setProfileForm({
        name: tenantData.name,
        email: tenantData.email,
        phone: tenantData.phone || '',
        primary_color: tenantData.primary_color || '#0066FF',
      });

      // Fetch services and working hours
      const [servicesRes, hoursRes] = await Promise.all([
        fetch(`/api/services?tenant_id=${tenantData.id}`),
        fetch(`/api/working-hours?tenant_id=${tenantData.id}`),
      ]);

      const servicesData = await servicesRes.json();
      const hoursData = await hoursRes.json();

      setServices(servicesData || []);
      setWorkingHours(hoursData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== 'loading') {
      loadData();
    }
  }, [status, session]);

  const handleSaveProfile = async () => {
    if (!tenant) return;
    setSaving(true);

    try {
      await fetch('/api/tenant/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileForm.name,
          phone: profileForm.phone || null,
          primary_color: profileForm.primary_color,
        }),
      });

      await loadData();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!tenant || !newService.name) return;
    setSaving(true);

    try {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenant.id,
          name: newService.name,
          duration: newService.duration,
          price: newService.price,
          description: newService.description || null,
          active: true,
        }),
      });

      setNewService({ name: '', duration: 60, price: 0, description: '' });
      await loadData();
    } catch (error) {
      console.error('Error adding service:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto službu?')) return;

    try {
      await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });
      await loadData();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleToggleService = async (id: string, active: boolean) => {
    try {
      await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !active }),
      });
      await loadData();
    } catch (error) {
      console.error('Error toggling service:', error);
    }
  };

  const handleSaveWorkingHours = async (dayOfWeek: number, startTime: string, endTime: string, isWorking: boolean) => {
    if (!tenant) return;

    try {
      const existing = workingHours.find((h) => h.day_of_week === dayOfWeek);

      if (existing) {
        await fetch(`/api/working-hours/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start_time: startTime,
            end_time: endTime,
            is_working: isWorking,
          }),
        });
      } else {
        await fetch('/api/working-hours', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenant_id: tenant.id,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            is_working: isWorking,
          }),
        });
      }

      await loadData();
    } catch (error) {
      console.error('Error saving working hours:', error);
    }
  };

  const handleSaveCategoryData = async (data: RestaurantData | WellnessData | BarbershopData | FitnessData) => {
    if (!tenant) return;

    try {
      await fetch('/api/tenant/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_data: data,
        }),
      });

      await loadData();
    } catch (error) {
      console.error('Error saving category data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">Tenant nenalezen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Nastavení</h1>
        <p className="text-[var(--text-muted)]">Správa vašeho profilu a služeb</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)]">
        {[
          { id: 'profile', label: 'Profil', icon: Building },
          { id: 'services', label: 'Služby', icon: Briefcase },
          { id: 'hours', label: 'Pracovní hodiny', icon: Clock },
          { id: 'category', label: 'Kategorie', icon: Grid3x3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[var(--primary)] text-[var(--primary)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Profil firmy</CardTitle>
            <CardDescription>Základní informace o vaší firmě</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Název firmy"
              value={profileForm.name}
              onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={profileForm.email}
              disabled
              className="bg-gray-100"
            />
            <Input
              label="Telefon"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                Primární barva
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={profileForm.primary_color}
                  onChange={(e) => setProfileForm({ ...profileForm, primary_color: e.target.value })}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input
                  value={profileForm.primary_color}
                  onChange={(e) => setProfileForm({ ...profileForm, primary_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>
            <Button onClick={handleSaveProfile} loading={saving}>
              <Save className="w-4 h-4 mr-2" />
              Uložit změny
            </Button>
          </div>
        </Card>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Přidat službu */}
          <Card>
            <CardHeader>
              <CardTitle>Přidat službu</CardTitle>
            </CardHeader>
            <div className="grid md:grid-cols-4 gap-4">
              <Input
                placeholder="Název služby"
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              />
              <Input
                type="number"
                placeholder="Délka (min)"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: parseInt(e.target.value) || 0 })}
              />
              <Input
                type="number"
                placeholder="Cena (Kč)"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: parseInt(e.target.value) || 0 })}
              />
              <Button onClick={handleAddService} disabled={!newService.name}>
                <Plus className="w-4 h-4 mr-2" />
                Přidat
              </Button>
            </div>
          </Card>

          {/* Seznam služeb */}
          <Card padding="none">
            <CardHeader className="p-6 pb-0">
              <CardTitle>Vaše služby</CardTitle>
            </CardHeader>
            <div className="divide-y divide-[var(--border)]">
              {services.map((service) => (
                <div key={service.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${!service.active && 'text-[var(--text-muted)] line-through'}`}>
                        {service.name}
                      </span>
                      {!service.active && (
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">Neaktivní</span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                      {service.duration} min | {formatPrice(service.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleService(service.id, service.active)}
                    >
                      {service.active ? 'Deaktivovat' : 'Aktivovat'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <div className="p-8 text-center text-[var(--text-muted)]">
                  Zatím nemáte žádné služby
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Working Hours Tab */}
      {activeTab === 'hours' && (
        <Card>
          <CardHeader>
            <CardTitle>Pracovní hodiny</CardTitle>
            <CardDescription>Nastavte kdy jste k dispozici pro rezervace</CardDescription>
          </CardHeader>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 0].map((dayOfWeek) => {
              const hours = workingHours.find((h) => h.day_of_week === dayOfWeek);
              return (
                <WorkingHoursRow
                  key={dayOfWeek}
                  dayName={DAY_NAMES[dayOfWeek]}
                  dayOfWeek={dayOfWeek}
                  startTime={hours?.start_time?.slice(0, 5) || '09:00'}
                  endTime={hours?.end_time?.slice(0, 5) || '17:00'}
                  isWorking={hours?.is_working ?? true}
                  onSave={handleSaveWorkingHours}
                />
              );
            })}
          </div>
        </Card>
      )}

      {/* Category Tab */}
      {activeTab === 'category' && tenant && (
        <Card>
          <CardHeader>
            <CardTitle>Nastavení kategorie</CardTitle>
            <CardDescription>
              Typ podniku: {getCategoryLabel(tenant.category)}
            </CardDescription>
          </CardHeader>
          <div>
            {tenant.category === 'RESTAURANT' && (
              <RestaurantSettings
                data={tenant.category_data as RestaurantData | null}
                onSave={handleSaveCategoryData}
              />
            )}
            {tenant.category === 'WELLNESS_SPA' && (
              <WellnessSettings
                data={tenant.category_data as WellnessData | null}
                onSave={handleSaveCategoryData}
              />
            )}
            {tenant.category === 'BARBERSHOP' && (
              <BarbershopSettings
                data={tenant.category_data as BarbershopData | null}
                onSave={handleSaveCategoryData}
              />
            )}
            {tenant.category === 'FITNESS_SPORT' && (
              <FitnessSettings
                data={tenant.category_data as FitnessData | null}
                onSave={handleSaveCategoryData}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

function WorkingHoursRow({
  dayName,
  dayOfWeek,
  startTime: initialStart,
  endTime: initialEnd,
  isWorking: initialWorking,
  onSave,
}: {
  dayName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
  onSave: (dayOfWeek: number, startTime: string, endTime: string, isWorking: boolean) => void;
}) {
  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(initialEnd);
  const [isWorking, setIsWorking] = useState(initialWorking);
  const [changed, setChanged] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    if (field === 'start') setStartTime(value as string);
    if (field === 'end') setEndTime(value as string);
    if (field === 'working') setIsWorking(value as boolean);
    setChanged(true);
  };

  const handleSave = () => {
    onSave(dayOfWeek, startTime, endTime, isWorking);
    setChanged(false);
  };

  return (
    <div className="flex items-center gap-4 py-2">
      <div className="w-24 font-medium">{dayName}</div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={isWorking}
          onChange={(e) => handleChange('working', e.target.checked)}
          className="w-4 h-4 rounded"
        />
        <span className="text-sm">Otevřeno</span>
      </label>
      {isWorking && (
        <>
          <input
            type="time"
            value={startTime}
            onChange={(e) => handleChange('start', e.target.value)}
            className="px-2 py-1 border border-[var(--border)] rounded text-sm"
          />
          <span>–</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => handleChange('end', e.target.value)}
            className="px-2 py-1 border border-[var(--border)] rounded text-sm"
          />
        </>
      )}
      {changed && (
        <Button size="sm" onClick={handleSave}>
          Uložit
        </Button>
      )}
    </div>
  );
}
